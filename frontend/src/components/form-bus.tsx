import React from 'react';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Form } from "@/components/ui/form"
import ClearIcon from "@/images/clear-icon.svg"
import { Button } from "@/components/ui/button"
import * as z from "zod"

const schema = z.object({
  busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
  busStop: z.string().min(1, "Ponto de ônibus é obrigatório"),
  startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
  endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
  email: z.string().email("E-mail inválido"),
}).refine((data) => data.startTime < data.endTime, {
  message: "O horário inicial deve ser anterior ao horário final",
  path: ["endTime"],
})

type FormData = z.infer<typeof schema>

const FormBusTracker: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data)
    // lllllllllllll
  }

  return (
      <Form onSubmit={handleSubmit(onSubmit)}>

      <div className='flex flex-col gap-4'>
        <div className='space-y-2'>
        <label >
          Linha do ônibus
        </label>
        <Input
          type="text"
          {...register("busLine")}
          placeholder="Ex: 123"
        />
      </div>

      <div className='space-y-2'>
        <label>
          Ponto de ônibus
        </label>
        <Input
          type="text"
          {...register("busStop")}
          placeholder="Ex: Central"
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label>
            Horário Inicial
          </label>
          <Input
            type="time"
            {...register("startTime")}          />
        </div>
        <div className="flex-1 space-y-2">
          <label>
            Horário Final
          </label>
          <Input
            type="time"
            {...register("endTime")}          />
        </div>
      </div>
      </div>
    <div className='pt-4'> </div>
      <Button
        type="submit"
        className='flex items-center justify-center w-full text-sm font-bold rounded-md text-center transition-all'
        >
        Enviar
      </Button>
    </Form>

  )
}

export default FormBusTracker
