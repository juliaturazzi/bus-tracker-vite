import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogCloseButton() {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log In</DialogTitle>
          <DialogDescription>
            Já possui conta? Insira seu usuário e senha!
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
          <Label htmlFor="name">Usuário</Label>
          <Input id="name"/>
          </div>
        <br/>
        </div>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
          <Label htmlFor="name">Senha</Label>
          <Input id="name"/>
          </div>
        <br/>
        </div>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
          <Button type="button">
            Não possui conta? Cadastre-se
          </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
        <Button type="button">
          Entrar
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Fechar
          </Button>
        </DialogClose>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
