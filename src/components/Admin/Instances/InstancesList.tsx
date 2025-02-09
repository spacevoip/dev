import React from 'react';
import { Server, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { PabxInstance } from '../../../types/admin';

const mockInstances: PabxInstance[] = [
  {
    id: '1',
    name: 'Company A',
    domain: 'company-a.pabx.com',
    status: 'active',
    credits: 1500,
    extensionsLimit: 50,
    extensionsUsed: 32,
    lastSync: new Date(),
  },
  {
    id: '2',
    name: 'Company B',
    domain: 'company-b.pabx.com',
    status: 'suspended',
    credits: 0,
    extensionsLimit: 20,
    extensionsUsed: 18,
    lastSync: new Date(),
  },
];

export const InstancesList = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">PABX Instances</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Instance
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extensions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockInstances.map((instance) => (
              <tr key={instance.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{instance.name}</div>
                      <div className="text-sm text-gray-500">{instance.domain}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    instance.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {instance.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={instance.credits === 0 ? 'text-red-600' : ''}>
                    {formatCurrency(instance.credits)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {instance.extensionsUsed}/{instance.extensionsLimit}
                    {instance.extensionsUsed >= instance.extensionsLimit * 0.9 && (
                      <AlertCircle className="h-4 w-4 text-orange-500 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {instance.lastSync.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};