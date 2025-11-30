import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LandingTheme, HeroConfig, AboutConfig, StatsConfig, SocialConfig, ContactConfig, CtaConfig } from "@/types/landingTheme";

interface SectionEditorProps {
    open: boolean;
    onClose: () => void;
    sectionKey: string | null;
    theme: LandingTheme;
    onSave: (theme: LandingTheme) => void;
}

export function SectionEditor({ open, onClose, sectionKey, theme, onSave }: SectionEditorProps) {
    if (!sectionKey || !theme.sections[sectionKey as keyof typeof theme.sections]) {
        return null;
    }

    const section = theme.sections[sectionKey as keyof typeof theme.sections];
    const config = section.config as any;

    const handleSave = (newConfig: any) => {
        const newSections = { ...theme.sections };
        (newSections[sectionKey as keyof typeof newSections] as any).config = newConfig;

        onSave({
            ...theme,
            sections: newSections,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Seção: {getSectionTitle(sectionKey)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {renderSectionEditor(sectionKey, config, handleSave)}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function getSectionTitle(key: string): string {
    const titles: Record<string, string> = {
        hero: "Hero / Banner Principal",
        about: "Sobre Mim",
        stats: "Estatísticas",
        social: "Redes Sociais",
        contact: "Contato",
        cta: "Botão 'Vamos Trabalhar Juntos'",
    };
    return titles[key] || key;
}

function renderSectionEditor(key: string, config: any, onSave: (config: any) => void) {
    switch (key) {
        case "hero":
            return <HeroEditor config={config} onSave={onSave} />;
        case "about":
            return <AboutEditor config={config} onSave={onSave} />;
        case "stats":
            return <StatsEditor config={config} onSave={onSave} />;
        case "social":
            return <SocialEditor config={config} onSave={onSave} />;
        case "contact":
            return <ContactEditor config={config} onSave={onSave} />;
        case "cta":
            return <CtaEditor config={config} onSave={onSave} />;
        default:
            return <div>Editor não disponível para esta seção</div>;
    }
}

// Hero Editor
function HeroEditor({ config, onSave }: { config: HeroConfig; onSave: (c: HeroConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div>
                <Label>Layout Desktop</Label>
                <select
                    value={localConfig.heroLayout || 'centered'}
                    onChange={(e) => setLocalConfig({ ...localConfig, heroLayout: e.target.value as any })}
                    className="w-full p-2 border rounded-md bg-background"
                >
                    <option value="centered">Centralizado</option>
                    <option value="split">Dividido (Imagem Esquerda / Texto Direita)</option>
                </select>
            </div>

            <div>
                <Label>Layout Mobile</Label>
                <select
                    value={localConfig.mobileLayout || 'stacked'}
                    onChange={(e) => setLocalConfig({ ...localConfig, mobileLayout: e.target.value as any })}
                    className="w-full p-2 border rounded-md bg-background"
                >
                    <option value="stacked">Empilhado (Padrão)</option>
                    <option value="split">Lado a Lado (Compacto)</option>
                </select>
            </div>

            <div>
                <Label>Título</Label>
                <Input
                    value={localConfig.title}
                    onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                    placeholder="Olá, sou [Nome]"
                />
                <p className="text-xs text-muted-foreground mt-1">Use [Nome] para inserir o nome do criador</p>
            </div>

            <div>
                <Label>Subtítulo</Label>
                <Input
                    value={localConfig.subtitle}
                    onChange={(e) => setLocalConfig({ ...localConfig, subtitle: e.target.value })}
                />
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showAvatar}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showAvatar: checked })}
                />
                <Label>Mostrar Avatar/Foto</Label>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showScrollIndicator}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showScrollIndicator: checked })}
                />
                <Label>Mostrar Indicador de Rolagem</Label>
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}

// About Editor
function AboutEditor({ config, onSave }: { config: AboutConfig; onSave: (c: AboutConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div>
                <Label>Título da Seção</Label>
                <Input
                    value={localConfig.title}
                    onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
                />
            </div>

            <div>
                <Label>Conteúdo</Label>
                <Textarea
                    value={localConfig.content}
                    onChange={(e) => setLocalConfig({ ...localConfig, content: e.target.value })}
                    rows={6}
                    placeholder="Conte um pouco sobre você..."
                />
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}

// Stats Editor
function StatsEditor({ config, onSave }: { config: StatsConfig; onSave: (c: StatsConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showFollowers}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showFollowers: checked })}
                />
                <Label>Mostrar Seguidores</Label>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showEngagement}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showEngagement: checked })}
                />
                <Label>Mostrar Engajamento</Label>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.animated}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, animated: checked })}
                />
                <Label>Animações</Label>
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}

// Social Editor  
function SocialEditor({ config, onSave }: { config: SocialConfig; onSave: (c: SocialConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div>
                <Label>Estilo dos Botões</Label>
                <select
                    value={localConfig.buttonStyle}
                    onChange={(e) => setLocalConfig({ ...localConfig, buttonStyle: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="filled">Preenchido</option>
                    <option value="outline">Contorno</option>
                    <option value="minimal">Minimal</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showLabels}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showLabels: checked })}
                />
                <Label>Mostrar Nomes das Redes</Label>
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}

// Contact Editor
function ContactEditor({ config, onSave }: { config: ContactConfig; onSave: (c: ContactConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div>
                <Label>Título do Formulário</Label>
                <Input
                    value={localConfig.formTitle}
                    onChange={(e) => setLocalConfig({ ...localConfig, formTitle: e.target.value })}
                />
            </div>

            <div>
                <Label>Texto do Botão Enviar</Label>
                <Input
                    value={localConfig.submitText}
                    onChange={(e) => setLocalConfig({ ...localConfig, submitText: e.target.value })}
                />
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    checked={localConfig.showForm}
                    onCheckedChange={(checked) => setLocalConfig({ ...localConfig, showForm: checked })}
                />
                <Label>Mostrar Formulário</Label>
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}
// CTA Editor
function CtaEditor({ config, onSave }: { config: CtaConfig; onSave: (c: CtaConfig) => void }) {
    const [localConfig, setLocalConfig] = React.useState(config);

    return (
        <div className="space-y-4">
            <div>
                <Label>Texto do Botão</Label>
                <Input
                    value={localConfig.text}
                    onChange={(e) => setLocalConfig({ ...localConfig, text: e.target.value })}
                />
            </div>

            <div>
                <Label>Link do Botão</Label>
                <Input
                    value={localConfig.link}
                    onChange={(e) => setLocalConfig({ ...localConfig, link: e.target.value })}
                    placeholder="#contact"
                />
            </div>

            <div>
                <Label>Estilo</Label>
                <select
                    value={localConfig.style}
                    onChange={(e) => setLocalConfig({ ...localConfig, style: e.target.value as any })}
                    className="w-full p-2 border rounded-md bg-background"
                >
                    <option value="filled">Preenchido</option>
                    <option value="outline">Contorno</option>
                    <option value="minimal">Minimal</option>
                </select>
            </div>

            <Button onClick={() => onSave(localConfig)} className="w-full">
                Salvar Alterações
            </Button>
        </div>
    );
}
