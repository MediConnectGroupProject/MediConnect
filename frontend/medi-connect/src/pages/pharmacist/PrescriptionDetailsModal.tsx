import React from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Calendar, User, FileText, CheckCircle } from 'lucide-react';

interface PrescriptionDetailsModalProps {
  prescription: any;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string, status: string) => void;
  isUpdating: boolean;
}

export const PrescriptionDetailsModal: React.FC<PrescriptionDetailsModalProps> = ({ 
  prescription, 
  isOpen, 
  onClose, 
  onAccept, 
  isUpdating 
}) => {
  if (!prescription) return null;

  const rawItems = prescription.rawItems || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Prescription Details
          </DialogTitle>
          <DialogDescription>
            Review the requested medications and gather them from the store before accepting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Patient & Doctor Info Bar */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Patient</p>
                <p className="font-medium text-gray-900">{prescription.patient}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Prescribing Doctor</p>
                <p className="font-medium text-gray-900">{prescription.doctor}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 col-span-2">
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Submitted Date</p>
                <p className="font-medium text-gray-900">{prescription.submittedAt}</p>
              </div>
            </div>
          </div>

          {/* Medication List */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Requested Medications</h3>
            {rawItems.length > 0 ? (
              <div className="space-y-4">
                {rawItems.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white border rounded-lg p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <h4 className="text-lg font-bold text-gray-800">
                          {item?.medicine?.name || item?.medicineName || 'Unknown Medicine'}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 font-medium pb-2">
                           {item?.quantity && (
                              <span className="flex items-center gap-1">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">Qty: {item.quantity}</span>
                              </span>
                           )}
                           {item?.durationText && (
                              <span className="flex items-center gap-1">
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">For {item.durationText} Days</span>
                              </span>
                           )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 font-semibold rounded-full text-sm">
                        {item?.dosage || 'N/A'}
                      </span>
                    </div>
                    {item?.instructions && (
                      <div className="mt-3 text-sm bg-yellow-50 p-3 rounded text-gray-800 border-l-2 border-yellow-400">
                        <span className="font-semibold block mb-1">Doctor's Instructions:</span>
                        {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic p-4 bg-gray-50 text-center rounded">
                No medication details found for this request.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 sm:justify-between items-center sm:flex-row flex-col gap-3">
          <p className="text-sm text-gray-500 italic mr-auto">
            Please physically gather all items before accepting.
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" 
                disabled={isUpdating}
                onClick={() => {
                   onAccept(prescription.id, 'VERIFIED');
                   onClose();
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm & Accept
              </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
