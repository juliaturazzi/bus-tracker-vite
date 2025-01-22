import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import CopyRight from "./copy-right";

interface BusTrackerInstructionsProps {
    open: boolean;
    onClose: () => void;
}

export function BusTrackerInstructions({open, onClose}: BusTrackerInstructionsProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-4xl p-4 sm:p-6 lg:max-w-3xl xl:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
                        Guia Bus Tracker
                    </DialogTitle>
                    <DialogDescription className="mt-4 text-sm sm:text-base text-center">
                        O Bus Tracker é um aplicativo inteligente que ajuda você a rastrear ônibus em tempo real e configurar alertas personalizados para nunca perder o seu ônibus. Siga este guia para entender como utilizá-lo.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto mt-6 space-y-6">
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold">Acesso ao Aplicativo</h2>
                        <div className="mt-2 space-y-4">
                            <div>
                                <h3 className="font-semibold text-md sm:text-lg">Usuário Não Cadastrado</h3>
                                <ul className="mt-1 ml-4 list-disc text-sm sm:text-base">
                                    <li>Selecione uma linha de ônibus: Digite o número ou código da linha desejada.</li>
                                    <li>Escolha um ponto de ônibus: Encontre o ponto de interesse no mapa ou na lista.</li>
                                    <li>
                                        Confira os resultados:
                                        <ul className="ml-4 list-disc">
                                            <li>Uma tabela será exibida com todos os ônibus da linha escolhida, indicando a distância atual de cada um até o ponto selecionado.</li>
                                            <li>O mapa mostrará os ônibus em tempo real através de ícones, facilitando a visualização.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold">Funcionalidades para Usuários Cadastrados</h2>
                        <div className="mt-2 space-y-4">
                            <p className="mt-1 text-sm sm:text-base">
                                Se você possui uma conta, faça o login para acessar funcionalidades exclusivas, como alertas e gerenciamento de agendamentos.
                            </p>
                            <div>
                                <h3 className="font-semibold text-md sm:text-lg">1. Criar Alertas</h3>
                                <p className="mt-1 text-sm sm:text-base">Você pode configurar alertas personalizados de duas formas:</p>
                                <ul className="mt-1 ml-4 list-disc text-sm sm:text-base">
                                    <li>
                                        <strong>Configuração Completa:</strong> Insira linha de ônibus, ponto de ônibus, intervalo de tempo (de no máximo uma hora) e distância máxima do ônibus até o ponto escolhido para receber as notificações.
                                    </li>
                                    <li>
                                        <strong>Configuração Rápida:</strong> Informe apenas a linha e o ponto de ônibus. O sistema usará o horário atual para calcular a distância entre os ônibus até o ponto escolhido e mostrar os ônibus em tempo real.
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-md sm:text-lg">2. Gerenciar Agendamentos</h3>
                                <p className="mt-1 text-sm sm:text-base">
                                    Acesse a aba Agendamentos para visualizar ou excluir alertas cadastrados.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-md sm:text-lg">3. Receber Notificações por E-mail</h3>
                                <p className="mt-1 text-sm sm:text-base">
                                    Sempre que um ônibus atender aos critérios configurados, você será notificado pelo e-mail cadastrado no aplicativo.
                                </p>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold">Visualização no Mapa</h2>
                        <p className="mt-1 text-sm sm:text-base">
                            Tanto usuários cadastrados quanto não cadastrados podem acompanhar a localização dos ônibus no mapa em tempo real.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-xl font-semibold">Dúvidas?</h2>
                        <p className="mt-1 text-sm sm:text-base">
                            Caso tenha problemas ou queira saber mais, entre em contato com nosso suporte. O Bus Tracker está aqui para tornar sua experiência com o transporte público mais prática e eficiente!
                        </p>
                        <p className="mt-2 text-sm sm:text-base">
                            Você pode entrar em contato conosco por e-mail:{" "}
                            <a href="mailto:info@bustracker.com.br" className="text-blue-600 underline">
                                info@bustracker.com.br
                            </a>
                        </p>
                    </section>
                    <section>
                        <CopyRight />
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
