import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RioUruguayService } from '../../services/rio-uruguay.service';

@Component({
  selector: 'app-multicotizador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './multicotizador.component.html',
  styleUrl: './multicotizador.component.css'
})
export class MulticotizadorComponent implements OnInit {

   apiUrl = 'https://sandbox.sis.rus.com.ar/api-rus/vehiculos/gruposModelo';
  cotizacionForm!: FormGroup;
  marcas: any[] = [];
  anios: number[] = [];
  modelos: any[] = [];
  versiones:any[]=[];

  public readonly tiposVehiculo = [
    { id: 1, nombre: 'AUTO' },
    { id: 2, nombre: 'PICK-UP "A"' },
    { id: 3, nombre: 'PICK-UP "B"' },
    { id: 4, nombre: 'CAMION HASTA 5 TN' },
    { id: 5, nombre: 'CAMION HASTA 10 TN' },
    { id: 6, nombre: 'CAMION MAS 10 TN' },
    { id: 25, nombre: 'MOTORHOME' },
    { id: 26, nombre: 'M3 OMNIBUS' }
  ];

  constructor(
    @Inject(RioUruguayService) private s_rus: RioUruguayService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadYears();
    this.setupValueChanges();
  }

  private initForm(): void {
    this.cotizacionForm = this.fb.group({
      tipoVehiculo: [null],
      marca: [{ value: null, disabled: true }],
      anio: [{ value: null, disabled: true }],
      modelo: [{ value: null, disabled: true }],
      version: [{ value: null, disabled: true }]
    });
  }

  private setupValueChanges(): void {
    this.cotizacionForm.get('tipoVehiculo')?.valueChanges.subscribe((tipo) => {
      if (tipo) {
        this.obtenerMarcas(tipo);
      } else {
        this.marcas = [];
        this.cotizacionForm.get('marca')?.disable();
      }
    });

    this.cotizacionForm.get('marca')?.valueChanges.subscribe((marca) => {
      this.cotizacionForm.get('anio')?.setValue(null);
      if (marca) {
        this.cotizacionForm.get('anio')?.enable();
      } else {
        this.cotizacionForm.get('anio')?.disable();
      }
    });

    this.cotizacionForm.get('anio')?.valueChanges.subscribe((anio) => {
      this.cotizacionForm.get('modelo')?.setValue(null);
      if (anio) {
        this.obtenerModelos();
      } else {
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    });

    this.cotizacionForm.get('modelo')?.valueChanges.subscribe((modelo) => {
      this.cotizacionForm.get('version')?.setValue(null);
      if (modelo) {
        this.obtenerVersiones();
      } else {
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    });
  }

  private loadYears(): void {
    const anioActual = new Date().getFullYear();
    this.anios = Array.from({ length: anioActual - 1989 }, (_, i) => anioActual - i);
  }

  private obtenerMarcas(tipo: number): void {
    this.s_rus.getMarcas(tipo).subscribe(
      (data: any) => {
        this.marcas = data.dtoList;
        this.cotizacionForm.get('marca')?.enable();
      },
      (error) => console.error('Error al obtener las marcas:', error)
    );
  }

  private obtenerModelos(): void {
    const { marca, anio } = this.cotizacionForm.value;
    if (!marca || !anio) return;

    this.s_rus.getModelos(marca, anio).subscribe(
      (data: any) => {

        this.modelos = data.dtoList; // Ajustar según la estructura de la respuesta
        this.cotizacionForm.get('modelo')?.enable();
      },
      (error) => {
        console.error('Error al obtener los modelos:', error);
        this.modelos = [];
        this.cotizacionForm.get('modelo')?.disable();
      }
    );
  }

  private obtenerVersiones(): void {
    const { modelo, anio, tipoVehiculo, marca } = this.cotizacionForm.value;
    if (!modelo) return;

    console.log("Enviando parámetros:", {
      idGrupoModelo: this.cotizacionForm.value.modelo,
      anio: this.cotizacionForm.value.anio,
      tipoUnidad: this.cotizacionForm.value.tipoVehiculo,
      idMarca: this.cotizacionForm.value.marca,
    });

    this.s_rus.getVersiones(modelo, anio, tipoVehiculo, marca).subscribe(
      (data: any) => {
        console.log(data);
        this.versiones = data.dtoList; // Ajustar según la estructura de la respuesta
        this.cotizacionForm.get('version')?.enable();
      },
      (error) => {
        console.error('Error al obtener las versiones:', error.message, error);
        this.versiones = [];
        this.cotizacionForm.get('version')?.disable();
      }
    );
  }

}
