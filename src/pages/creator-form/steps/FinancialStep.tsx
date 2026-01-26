import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatorFormData } from "@/types/creatorForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface FinancialStepProps {
    formData: CreatorFormData;
    setFormData: (data: CreatorFormData) => void;
}

export function FinancialStep({ formData, setFormData }: FinancialStepProps) {

    const handleChange = (field: keyof CreatorFormData, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleGenerateContract = async () => {
        if (!formData.legal_name || !formData.document_id) {
            toast({ title: "Dados Incompletos", description: "Preencha Nome Legal e CPF/CNPJ.", variant: "destructive" });
            return;
        }

        toast({ title: "Gerando Contrato...", description: "Criando minuta padrão de prestação de serviços." });

        setTimeout(() => {
            handleChange('contract_status', 'draft');
            toast({ title: "Minuta Criada 📄", description: "O contrato está pronto para revisão." });
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    💰 Dados Financeiros & Pix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Chave Pix</Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.pix_key_type}
                                onValueChange={(v) => handleChange('pix_key_type', v)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cpf">CPF</SelectItem>
                                    <SelectItem value="cnpj">CNPJ</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Celular</SelectItem>
                                    <SelectItem value="random">Aleatória</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Chave Pix"
                                value={formData.pix_key}
                                onChange={(e) => handleChange('pix_key', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Banco (Opcional)</Label>
                        <Input
                            placeholder="Nome do Banco"
                            value={formData.bank_name}
                            onChange={(e) => handleChange('bank_name', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    ⚖️ Dados Legais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nome Legal / Razão Social</Label>
                        <Input
                            placeholder="Nome completo para contrato"
                            value={formData.legal_name}
                            onChange={(e) => handleChange('legal_name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>CPF / CNPJ</Label>
                        <Input
                            placeholder="000.000.000-00"
                            value={formData.document_id}
                            onChange={(e) => handleChange('document_id', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Endereço Completo</Label>
                        <Input
                            placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                            value={formData.address_street}
                            onChange={(e) => handleChange('address_street', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Contract Generator Module */}
            <div className="space-y-4 pt-4 border-t border-white/10 bg-card/30 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            📄 Contrato de Prestação de Serviços
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Gere uma minuta automática baseada nos dados acima.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {formData.contract_status === 'draft' && <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider bg-yellow-500/10 px-2 py-1 rounded">Rascunho</span>}
                        {formData.contract_status === 'signed' && <span className="text-green-500 text-xs font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Assinado</span>}
                    </div>
                </div>

                {formData.contract_status === 'none' ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={handleGenerateContract}>
                        <FileText className="w-10 h-10 text-muted-foreground mb-2" />
                        <span className="font-medium">Gerar Minuta de Contrato</span>
                        <span className="text-xs text-muted-foreground">Modelo Padrão (Sem valores específicos)</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Card className="p-4 flex items-center justify-between bg-background">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Contrato_Prestacao_Servicos_{formData.legal_name?.split(' ')[0]}.pdf</p>
                                    <p className="text-xs text-muted-foreground">Gerado em {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" /> Baixar
                                </Button>
                                {formData.contract_status !== 'signed' && (
                                    <Button size="sm" onClick={() => handleChange('contract_status', 'signed')} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Marcar Assinado
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {formData.contract_status === 'draft' && (
                            <p className="text-xs text-muted-foreground text-center">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Aguardando assinatura. Envie este arquivo para o influenciador.
                            </p>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
