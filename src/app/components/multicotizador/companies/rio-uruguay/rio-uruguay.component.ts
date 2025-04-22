import { Component, Input } from '@angular/core';
import { RioUruguayService } from '../../../../services/rio-uruguay.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-rio-uruguay',
  standalone: true,
  imports: [],
  templateUrl: './rio-uruguay.component.html',
  styleUrl: './rio-uruguay.component.css'
})
export class RioUruguayComponent {


  @Input() cotizacionForm!: FormGroup;

  private marcas!: any[];
  private modelos!:any[];
  private versiones!:any[];
  private tipoVehiculo:string="";


  constructor(private s_rus: RioUruguayService){

  }

  public readonly tiposVehiculo = [
    { id: 7, nombre: 'MOTO MENOS 50 CC' },
    { id: 8, nombre: 'MOTO MAS 50 CC' },
    { id: 1, nombre: 'AUTO' },
    { id: 2, nombre: 'PICK-UP "A"' },
    { id: 3, nombre: 'PICK-UP "B"' },
    { id: 4, nombre: 'CAMION HASTA 5 TN' },
    { id: 5, nombre: 'CAMION HASTA 10 TN' },
    { id: 6, nombre: 'CAMION MAS 10 TN' },
    { id: 25, nombre: 'MOTORHOME' },
    { id: 26, nombre: 'M3 OMNIBUS' },
  ];


  private obtenerMarcasRUS(tipo: number): void {




    this.s_rus.getMarcas(tipo).subscribe({
      next: (data: any) => {
        this.marcas = data.dtoList;
        console.log(this.marcas);
      },
      error: (error) => console.error('Error al obtener las marcas:', error)
    });

  }

  private obtenerModelosRUS(): void {
    const { marca, anio, tipoVehiculo } = this.cotizacionForm.value;
    if (!marca || !anio) return;

    const tipo=Number(tipoVehiculo);

    this.s_rus.getModelos(marca.id, anio,tipo).subscribe({
      next: (data: any) => {
        this.modelos = data.dtoList;
        console.log(this.modelos);
      },
      error: (error) => {
        console.error('Error al obtener los modelos:', error);
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    });
  }

  private obtenerVersionesRUS(): void {
    const { modelo, anio, tipoVehiculo, marca } = this.cotizacionForm.value;
    if (!modelo) return;

    this.tipoVehiculo=tipoVehiculo;


    this.s_rus.getVersiones(modelo.id, anio, tipoVehiculo, marca).subscribe({
      next: (data: any) => {
        this.versiones = data.dtoList;
        console.log(data.dtoList);
        this.cotizacionForm.get('version')?.enable();
      },
      error: (error) => {
        console.error('Error al obtener las versiones:', error);
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });
  }
}
