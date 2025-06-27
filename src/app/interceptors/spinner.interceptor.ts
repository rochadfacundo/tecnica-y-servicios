import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SpinnerService } from '../services/spinner.service';
import { finalize } from 'rxjs/operators';
import { ESpinner } from '../enums/ESpinner';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(SpinnerService);

  spinner.show(ESpinner.Vaiven);

  return next(req).pipe(
    finalize(() => spinner.hide(ESpinner.Vaiven))
  );
};
