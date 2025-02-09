import React, { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  FileUp, 
  Table as TableIcon, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';

interface NovoMailingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB em bytes
const MAX_ROWS = 200000; // 200 mil linhas

export function NovoMailingModal({ isOpen, onClose, onSuccess }: NovoMailingModalProps) {
  const { currentUser } = useCurrentUser();
  const [nome, setNome] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const resetForm = () => {
    setNome('');
    setFile(null);
    setCsvPreview(null);
    setError(null);
    setUploadProgress(0);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);
    
    if (!selectedFile) return;

    // Validar tamanho do arquivo
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('O arquivo não pode ser maior que 50MB');
      return;
    }

    // Validar extensão
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('O arquivo deve ser um CSV');
      return;
    }

    setFile(selectedFile);

    // Processar arquivo imediatamente após seleção
    setLoading(true);
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      
      // Simular progresso de upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Validar número de linhas
      if (lines.length > MAX_ROWS) {
        setError('O arquivo não pode ter mais de 200.000 linhas');
        setFile(null);
        return;
      }

      const headers = lines[0].split(',').map(header => header.trim());
      const previewRows = lines
        .slice(1, 4) // Pegar 3 primeiras linhas para preview
        .map(line => line.split(',').map(cell => cell.trim()));

      setCsvPreview({
        headers,
        rows: previewRows,
        totalRows: lines.length - 1, // -1 para excluir o cabeçalho
      });
    } catch (error) {
      setError('Erro ao ler o arquivo CSV');
      console.error('Erro ao ler CSV:', error);
    } finally {
      setLoading(false);
      setUploadProgress(100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !nome || !csvPreview) return;

    setLoading(true);
    setShowProgress(true);
    setUploadProgress(0);
    
    try {
      // Mostrar alerta de progresso
      toast(
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Por favor, não feche esta janela. Aguarde o carregamento do seu Mailing...
          </AlertDescription>
        </Alert>,
        {
          duration: 0,
          id: 'upload-progress'
        }
      );

      // 1. Fazer upload do arquivo CSV para o Storage
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${nome.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `${currentUser?.accountid}/mailings/${fileName}`;

      setUploadProgress(5);
      const { error: uploadError } = await supabase.storage
        .from('mailings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setUploadProgress(10);

      // 2. Salvar na tabela mailing_manager
      const { data: mailingData, error: mailingError } = await supabase
        .from('mailing_manager')
        .insert([
          {
            nome,
            quantidade: csvPreview.totalRows,
            accountid: currentUser?.accountid,
            arquivo_url: filePath
          }
        ])
        .select()
        .single();

      if (mailingError) throw mailingError;
      setUploadProgress(15);

      // 3. Processar o arquivo em lotes
      const reader = new FileReader();
      const CHUNK_SIZE = 1024 * 1024; // 1MB por chunk
      let offset = 0;
      let headers: string[] = [];
      let firstChunk = true;
      let processedLines = 0;
      const totalSize = file.size;

      const processChunk = async (chunk: string) => {
        const lines = chunk.split('\n');
        
        // Se for o primeiro chunk, pegar os headers
        if (firstChunk) {
          headers = lines[0].split(',').map(header => header.trim());
          lines.shift(); // Remove a linha de headers
          firstChunk = false;
        }

        // Processar linhas do chunk
        const registros = lines
          .filter(line => line.trim()) // Remove linhas vazias
          .map(line => {
            const values = line.split(',').map(value => value.trim());
            const dados = {};
            headers.forEach((header, index) => {
              dados[header] = values[index] || '';
            });
            return {
              nome: file.name,
              nome_mailling: nome,
              dados,
              accountid: currentUser?.accountid,
              arquivo_url: filePath
            };
          });

        // Inserir registros em lotes menores
        const BATCH_SIZE = 1000;
        for (let i = 0; i < registros.length; i += BATCH_SIZE) {
          const batch = registros.slice(i, i + BATCH_SIZE);
          const { error: clientesError } = await supabase
            .from('mailing_clientes')
            .insert(batch);

          if (clientesError) {
            await supabase.storage
              .from('mailings')
              .remove([filePath]);
            throw clientesError;
          }

          processedLines += batch.length;
          // Calcular progresso (15-100%)
          const progress = Math.min(100, 15 + Math.floor((processedLines / csvPreview.totalRows) * 85));
          setUploadProgress(progress);
        }
      };

      const readNextChunk = () => {
        return new Promise<void>((resolve, reject) => {
          const blob = file.slice(offset, offset + CHUNK_SIZE);
          reader.onload = async (e) => {
            try {
              const chunk = e.target?.result as string;
              await processChunk(chunk);
              offset += CHUNK_SIZE;
              
              if (offset < file.size) {
                await readNextChunk();
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsText(blob);
        });
      };

      await readNextChunk();

      // Remover o toast de progresso
      toast.dismiss('upload-progress');
      // Atualizar alerta com sucesso
      toast(
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Mailing cadastrado com sucesso!
          </AlertDescription>
        </Alert>,
        {
          duration: 3000,
          id: 'upload-success'
        }
      );
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar mailing:', error);
      toast.dismiss('upload-progress');
      // Em caso de erro
      toast(
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Erro ao cadastrar mailing
          </AlertDescription>
        </Alert>,
        {
          duration: 3000,
          id: 'upload-error'
        }
      );
    } finally {
      setLoading(false);
      setShowProgress(false);
    }
  };

  const getValidationStatus = () => {
    if (!file) return null;

    const validations = [
      {
        label: 'Tamanho do arquivo',
        valid: file.size <= MAX_FILE_SIZE,
        message: `Máximo: 50MB (${(file.size / 1024 / 1024).toFixed(2)}MB atual)`,
      },
      {
        label: 'Formato do arquivo',
        valid: file.name.toLowerCase().endsWith('.csv'),
        message: 'Deve ser CSV',
      },
      {
        label: 'Número de linhas',
        valid: csvPreview ? csvPreview.totalRows <= MAX_ROWS : true,
        message: csvPreview ? `${csvPreview.totalRows.toLocaleString()} de ${MAX_ROWS.toLocaleString()}` : 'Analisando...',
      },
    ];

    return (
      <div className="space-y-2 mt-4">
        {validations.map((validation, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span>{validation.label}</span>
            </div>
            <span className="text-gray-500 ml-6 sm:ml-0">{validation.message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[600px] h-[600px] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="space-y-3 flex-shrink-0">
            <DialogTitle>Novo Mailing</DialogTitle>
            <DialogDescription>
              Cadastre um novo mailing através de um arquivo CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 flex-1 overflow-y-auto">
            {/* Nome do Mailing */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Mailing</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Campanha Janeiro 2025"
                required
                className="w-full"
              />
            </div>

            {/* Upload CSV */}
            <div className="space-y-2">
              <Label>Arquivo CSV</Label>
              <div className={`
                border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors
                ${file ? 'bg-gray-50 border-gray-300' : 'hover:bg-gray-50 border-gray-200'}
              `}>
                {!file ? (
                  <label className="flex flex-col items-center cursor-pointer">
                    <FileSpreadsheet className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-600 text-center">
                      Clique para selecionar ou arraste o arquivo
                    </span>
                    <span className="text-xs text-gray-400 mt-1 text-center">
                      Máximo: 50MB, 200.000 linhas
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)}MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setCsvPreview(null);
                          setError(null);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Remover
                      </Button>
                    </div>

                    {uploadProgress > 0 && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} />
                        <p className="text-xs text-gray-500 text-right">
                          {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {getValidationStatus()}
                  </div>
                )}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview do CSV */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Processando arquivo...</p>
                  <p className="text-xs text-gray-500">Isso pode levar alguns segundos</p>
                </div>
              </div>
            ) : csvPreview && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Preview dos dados (3 primeiros registros)
                  </span>
                </div>

                <div className="rounded border overflow-auto" style={{ maxHeight: 'calc(100vh - 450px)' }}>
                  <div className="min-w-max">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {csvPreview.headers.map((header, i) => (
                            <TableHead key={i} className="text-xs whitespace-nowrap bg-white sticky top-0">
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvPreview.rows.map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="text-xs py-2 whitespace-nowrap">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TableIcon className="h-4 w-4" />
                  <span>
                    {csvPreview.totalRows.toLocaleString()} registros encontrados
                  </span>
                </div>
              </div>
            )}
          </div>

          {showProgress && (
            <div className="space-y-2 mt-4">
              <Alert className="bg-blue-50">
                <AlertDescription>
                  Por favor, não feche esta janela. Aguarde o carregamento do seu Mailing...
                </AlertDescription>
              </Alert>
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-gray-500 text-right">
                  {uploadProgress}% Concluído
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-3 flex-shrink-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !file || !nome || !csvPreview}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Mailing'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
