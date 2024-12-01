import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface BusTrackerInstructionsProps {
    open: boolean;
    onClose: () => void;
}

export function BusTrackerInstructions({ open, onClose }: BusTrackerInstructionsProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Guia Bus Tracker
                    </DialogTitle>
                    <DialogDescription className="mt-4 text-sm">
                        O Bus Tracker é um aplicativo inteligente que ajuda você a rastrear ônibus em tempo real e configurar alertas personalizados para nunca perder o transporte. Siga este guia para entender como utilizá-lo.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <section>
                        <h2 className="text-lg font-semibold">Acesso ao Aplicativo</h2>
                        <div className="mt-2 space-y-4">
                            <div>
                                <h3 className="font-semibold">Usuário Não Cadastrado</h3>
                                <ul className="mt-1 ml-4 list-disc text-sm">
                                    <li>Selecione uma linha de ônibus: Digite o número ou nome da linha desejada.</li>
                                    <li>Escolha um ponto de ônibus: Encontre o ponto de interesse no mapa ou na lista.</li>
                                    <li>
                                        Confira os resultados:
                                        <ul className="ml-4 list-disc">
                                            <li>Uma tabela será exibida com todos os ônibus da linha escolhida, indicando a distância de cada um até o ponto selecionado.</li>
                                            <li>O mapa mostrará os ônibus em tempo real através de ícones, facilitando o acompanhamento.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-semibold">Funcionalidades para Usuários Cadastrados</h2>
                        <div className="mt-2 space-y-4">
                            <p className="mt-1 text-sm">
                                    Se você possui uma conta, faça o login para acessar funcionalidades exclusivas, como alertas e gerenciamento de agendamentos.
                                </p>
                            <div>
                                <h3 className="font-semibold">1. Criar Alertas</h3>
                                <p className="mt-1 text-sm">Você pode configurar alertas personalizados de duas formas:</p>
                                <ul className="mt-1 ml-4 list-disc text-sm">
                                    <li>
                                        <strong>Configuração Completa:</strong> Insira linha de ônibus, ponto de ônibus, intervalo de tempo e distância mínima para notificações.
                                    </li>
                                    <li>
                                        <strong>Configuração Rápida:</strong> Informe apenas a linha e o ponto de ônibus. O sistema usará o horário atual para calcular notificações.
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">2. Gerenciar Agendamentos</h3>
                                <p className="mt-1 text-sm">
                                    Acesse a aba Agendamentos para visualizar, editar ou excluir alertas cadastrados.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">3. Receber Notificações por E-mail</h3>
                                <p className="mt-1 text-sm">
                                    Sempre que um ônibus atender aos critérios configurados, você será notificado por e-mail.
                                </p>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-semibold">Visualização no Mapa</h2>
                        <p className="mt-1 text-sm">
                            Tanto usuários cadastrados quanto não cadastrados podem acompanhar a localização dos ônibus no mapa em tempo real.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg font-semibold">Dúvidas?</h2>
                        <p className="mt-1 text-sm">
                            Caso tenha problemas ou queira saber mais, entre em contato com nosso suporte. O Bus Tracker está aqui para tornar sua experiência com o transporte público mais prática e eficiente!
                        </p>
                        <p className="mt-2 text-sm">
                            Você pode entrar em contato conosco por e-mail:{" "}
                            <a href="mailto:bustrackerrio@gmail.com" className="text-blue-600 underline">
                                bustrackerrio@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
