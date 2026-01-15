import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Company, MarketingStrategy } from '@/types/marketing';
import { generateDefaultContract } from '@/utils/contractTemplate';
import { Printer } from 'lucide-react';

interface ContractPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    company: Company | null;
    strategies: MarketingStrategy[];
}

export function ContractPreviewDialog({ open, onClose, company, strategies }: ContractPreviewDialogProps) {
    const [contractText, setContractText] = useState('');

    useEffect(() => {
        if (company && open) {
            setContractText(generateDefaultContract(company, strategies, "AGÊNCIA ETERNIZAR"));
        }
    }, [company, strategies, open]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Contrato - ${company?.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');

                    body {
                        font-family: 'Merriweather', serif;
                        line-height: 1.8;
                        color: #1a1a1a;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px;
                        font-size: 11pt;
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 50px;
                        border-bottom: 2px solid #1a1a1a;
                        padding-bottom: 20px;
                    }

                    .logo {
                        font-family: 'Open Sans', sans-serif;
                        font-weight: 600;
                        font-size: 10pt;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 10px;
                    }

                    h1 {
                        font-size: 18pt;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin: 0;
                    }

                    .content {
                        white-space: pre-wrap;
                        text-align: justify;
                    }

                    /* Tenta justificar o texto pre-wrap mantendo quebras de linha */
                    .content {
                        text-align: justify;
                    }

                    .signature-section {
                        margin-top: 80px;
                        display: flex;
                        justify-content: space-between;
                        page-break-inside: avoid;
                    }

                    .signature-block {
                        width: 45%;
                        text-align: center;
                        border-top: 1px solid #1a1a1a;
                        padding-top: 10px;
                        font-family: 'Open Sans', sans-serif;
                        font-size: 10pt;
                    }

                    @media print {
                        body { padding: 0.5cm; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Agência Eternizar</div>
                    <h1>Contrato de Prestação de Serviços</h1>
                </div>

                <div class="content">${contractText}</div>

                <div class="signature-section">
                    <div class="signature-block">
                        <strong>AGÊNCIA ETERNIZAR</strong><br>
                        CONTRATADA
                    </div>
                    <div class="signature-block">
                        <strong>${company?.name.toUpperCase()}</strong><br>
                        CONTRATANTE
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editor de Contrato</DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 bg-muted/30 p-4 rounded-md border border-border">
                    <Textarea
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        className="w-full h-full resize-none font-mono text-sm leading-relaxed p-6 bg-white shadow-sm border-0 focus-visible:ring-0"
                    />
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center mt-4">
                    <p className="text-xs text-muted-foreground">
                        Edite o texto conforme necessário. O PDF será gerado exatamente com este conteúdo.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="w-4 h-4" />
                            Imprimir / Salvar PDF
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
