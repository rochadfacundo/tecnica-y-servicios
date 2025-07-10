import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appImageLoader]',
  standalone: true
})
export class ImageLoaderDirective implements OnInit{

  @Input('appImageLoader') realSrc!: string; // Imagen real
  @Input() placeholderSrc: string = 'assets/logo.png'; // Placeholder por defecto

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const imgElement = this.el.nativeElement as HTMLImageElement;

    // Paso 1: setea la imagen placeholder de inmediato
    this.renderer.setAttribute(imgElement, 'src', this.placeholderSrc);

    // Paso 2: crea la imagen real y espera a que cargue
    const img = new Image();
    img.src = this.realSrc;

    img.onload = () => {
      // Cuando está cargada, se reemplaza
      this.renderer.setAttribute(imgElement, 'src', this.realSrc);
    };
  }

}
