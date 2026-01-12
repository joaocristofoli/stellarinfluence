import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Company } from '@/types/marketing';

interface CompanyFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    editingCompany?: Company | null;
}

export function CompanyForm({
    open,
    onClose,
    onSave,
    onDelete,
    editingCompany
}: CompanyFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        primaryColor: '#7c3aed',
        secondaryColor: '#f97316',
        logoUrl: '',
        city: '',
        state: '',
        cnpj: '',
        address: '',
        representativeName: '',
        representativeRole: '',
    });

    useEffect(() => {
        if (editingCompany) {
            setFormData({
                name: editingCompany.name,
                description: editingCompany.description || '',
                primaryColor: editingCompany.primaryColor || '#7c3aed',
                secondaryColor: editingCompany.secondaryColor || '#f97316',
                logoUrl: editingCompany.logoUrl || '',
                city: editingCompany.city || '',
                state: editingCompany.state || '',
                cnpj: editingCompany.cnpj || '',
                address: editingCompany.address || '',
                representativeName: editingCompany.representativeName || '',
                representativeRole: editingCompany.representativeRole || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                primaryColor: '#7c3aed',
                secondaryColor: '#f97316',
                logoUrl: '',
                city: '',
                state: '',
                cnpj: '',
                address: '',
                representativeName: '',
                representativeRole: '',
            });
        }
    }, [editingCompany, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name,
            description: formData.description || null,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            logoUrl: formData.logoUrl || null,
            city: formData.city || null,
            state: formData.state || null,
            cnpj: formData.cnpj || null,
            address: formData.address || null,
            representativeName: formData.representativeName || null,
            representativeRole: formData.representativeRole || null,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingCompany
                            ? 'Atualize as informações da empresa e dados para contrato.'
                            : 'Cadastre uma nova empresa e seus dados fiscais.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name">Nome da Empresa *</Label>
                        <Input
                            id="company-name"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: ai q fome"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva brevemente a empresa..."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Ex: Toledo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                placeholder="Ex: PR"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    {/* Dados Fiscais/Contrato */}
                    <div className="border-t border-border pt-4 mt-2">
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground">Dados para Contrato</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input
                                        id="cnpj"
                                        value={formData.cnpj}
                                        onChange={e => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Endereço Completo</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Rua, Número, Bairro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="representativeName">Nome do Representante</Label>
                                    <Input
                                        id="representativeName"
                                        value={formData.representativeName}
                                        onChange={e => setFormData(prev => ({ ...prev, representativeName: e.target.value }))}
                                        placeholder="Nome Completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="representativeRole">Cargo do Representante</Label>
                                    <Input
                                        id="representativeRole"
                                        value={formData.representativeRole}
                                        onChange={e => setFormData(prev => ({ ...prev, representativeRole: e.target.value }))}
                                        placeholder="Ex: Sócio-Administrador"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-2">
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground">Identidade Visual</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Cor Principal</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primaryColor"
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={formData.primaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                        placeholder="#7c3aed"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secondaryColor"
                                        type="color"
                                        value={formData.secondaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={formData.secondaryColor}
                                        onChange={e => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                        placeholder="#f97316"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-4 border-t border-border">
                        <div>
                            {editingCompany && onDelete && (
                                <Button type="button" variant="destructive" onClick={onDelete}>
                                    Excluir
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="gradient-primary">
                                {editingCompany ? 'Salvar' : 'Criar Empresa'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
