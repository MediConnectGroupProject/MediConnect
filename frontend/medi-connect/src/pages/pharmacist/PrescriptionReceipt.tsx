import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Printer } from 'lucide-react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import logo from '../../assets/logo-mediconnect.png';

interface PrescriptionReceiptProps {
  prescription: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionReceipt: React.FC<PrescriptionReceiptProps> = ({ prescription, isOpen, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // A simple approach since react-to-print isn't installed.
    // We isolate the receipt content and print it native to the browser.
    const printContent = contentRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;

    window.print();

    // Restore the original page contents
    document.body.innerHTML = originalContents;
    window.location.reload(); // Refresh to restore React bindings properly after a hard print hijack
  };

  if (!prescription) return null;

  // Derive medications from the semi-flattened object passed from PharmacistPortal
  // In PharmacistPortal, we flattened medication names/dosages. Let's build a safe array here by splitting strings if they exist,
  // or iterating if we modify the parent map. For now, since the parent joined them by `, `, we do a rudimentary split.
  // Ideally, passing the raw array item down is safer. We'll assume the parent will pass `rawItems` in the future,
  // but for now we parse what we have.
  const rawItems = prescription.rawItems || []; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white">
        {/* Printable Area Container */}
        <div className="p-6 pt-0" /* To avoid printing UI wrappers */>
          <div ref={contentRef} className="bg-white text-black p-4 w-full">
            
            {/* Header matches mock: Logo + "MediConnect" */}
            <div className="flex flex-col items-center justify-center mb-6 border-b pb-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                 <img src={logo} alt="MediConnect" className="h-8 w-auto mr-2" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-center">Medicine Instructions</h1>
            </div>

            {/* Content Match Mock */}
            <div className="space-y-4 mb-6">
              {rawItems.length > 0 ? (
                rawItems.map((item: any, idx: number) => (
                  <div key={idx} className="border border-gray-600 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2 font-bold text-sm">
                      <span>{item?.medicine?.name || item?.medicineName || 'Unknown Medicine'}</span>
                      <span>{item?.dosage || 'N/A'}</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold mb-1">Instructions:</p>
                      <p className="text-gray-700">{item?.instructions || 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="text-center italic text-sm text-gray-500 py-4">No specific instructions structured found. Refer to label.</div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="text-xs text-center text-gray-600 border-t pt-4">
               <p><b>Note:</b> Please contact your doctor or pharmacist if you experience any unexpected side effects.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
           <Button variant="outline" onClick={onClose}>Cancel</Button>
           <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
