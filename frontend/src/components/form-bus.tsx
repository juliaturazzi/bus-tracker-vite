<<<<<<< Updated upstream
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import * as z from "zod";
import { Slider } from "@/components/ui/slider";
=======
import React from 'react';
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Input} from "@/components/ui/input"
import {Form} from "@/components/ui/form"
import {Button} from "@/components/ui/button"
import {AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from "@/components/ui/alert-dialog"
import StopsDropdown from "./stops-dropdown"
import * as z from "zod"
>>>>>>> Stashed changes

const schema = z.object({
  busLine: z.string().min(1, "Linha do ônibus é obrigatória"),
  busStop: z.string().min(1, "Ponto de ônibus é obrigatório"),
  startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
  endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido"),
  email: z.string().email("E-mail inválido"),
}).refine((data) => data.startTime < data.endTime, {
  message: "O horário inicial deve ser anterior ao horário final",
  path: ["endTime"],
});

type FormData = z.infer<typeof schema>;

const FormBusTracker: React.FC = () => {
  const {register, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [sliderValue, setSliderValue] = useState<number[]>([10]); // Track the slider value

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
    // lllllllllllll
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
<<<<<<< Updated upstream
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label>Linha do ônibus</label>
=======

      <div className='flex flex-col gap-4'>
        <div className='space-y-2'>
          <label >
            Linha do ônibus
          </label>
>>>>>>> Stashed changes
          <Input
            type="text"
            {...register("busLine")}
            placeholder="Ex: 123"
          />
        </div>

<<<<<<< Updated upstream
        <div className="space-y-2">
          <label>Ponto de ônibus</label>
          <Input
            type="text"
            {...register("busStop")}
            placeholder="Ex: Central"
          />
=======
        <div className='space-y-2'>
          <label>
            Ponto de ônibus
          </label>
          <StopsDropdown
            {...register("busStop")}/>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 space-y-2">
            <label>
              Horário Inicial
            </label>
            <Input
              type="time"
              {...register("startTime")} />
          </div>
          <div className="flex-1 space-y-2">
            <label>
              Horário Final
            </label>
            <Input
              type="time"
              {...register("endTime")} />
          </div>
>>>>>>> Stashed changes
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 space-y-2">
            <label>Horário Inicial</label>
            <Input type="time" {...register("startTime")} />
          </div>
          <div className="flex-1 space-y-2">
            <label>Horário Final</label>
            <Input type="time" {...register("endTime")} />
          </div>
        </div>

        <label>Distância do ônibus (em minutos)</label>
        <div className="flex items-center space-x-4 text-sm">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue} // Update state when slider value changes
            defaultValue={[10]}
            min={1}
            max={60}
            step={1}
          />
          <span>{sliderValue[0]} min</span> {/* Display the current value */}
      </div>
<<<<<<< Updated upstream


      </div>
=======
      <div className='pt-4'> </div>
      <AlertDialog>
        <AlertDialogTrigger >
          <Button
            type="submit"
          >
            Enviar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alerta cadastrado com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Linha de ônibus: {/* busLine */} <br />
              Ponto de ônibus: {/* busStop */} <br />
              Horário Inicial: {/* starTime */} <br />
              Horário Final: {/* endTime */} <br />
              Distância do ônibus (em minutos): {/* distanceTime */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ver alerta</AlertDialogAction>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
>>>>>>> Stashed changes

      <div className="pt-4" />
      <AlertDialog>
        <AlertDialogTrigger>
          <Button type="submit">Enviar</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alerta cadastrado com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Linha de ônibus: {/* busLine */} <br />
              Ponto de ônibus: {/* busStop */} <br />
              Horário Inicial: {/* startTime */} <br />
              Horário Final: {/* endTime */} <br />
              Distância do ônibus (em minutos): {sliderValue[0]}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ver alerta</AlertDialogAction>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};

export default FormBusTracker;
