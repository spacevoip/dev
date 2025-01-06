import React, { useState } from 'react';
import { InstancesList } from '../../components/Admin/Instances/InstancesList';
import { InstanceForm } from '../../components/Admin/Instances/InstanceForm';
import { Plus } from 'lucide-react';

export const AdminInstances = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateInstance = (data: {
    name: string;
    domain: string;
    extensionsLimit: number;
  }) => {
    console.log('Create instance:', data);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PABX Instances</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all PABX instances and their configurations
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Instance
        </button>
      </div>
      
      <InstancesList />

      <InstanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateInstance}
      />
    </div>
  );
};