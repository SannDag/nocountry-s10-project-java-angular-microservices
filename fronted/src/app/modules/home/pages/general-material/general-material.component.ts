import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators,  FormGroup} from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { GeneralDataRequest } from 'src/app/models/general-data-request';
import { AuthService } from 'src/app/services/auth.service';
import { InactivityService } from 'src/app/services/inactivity.service';
import { LoansApplicationService } from 'src/app/services/loans-application.service';
import { TokenService } from 'src/app/services/token.service';


@Component({
  selector: 'app-general-material',
  templateUrl: './general-material.component.html',
  styleUrls: ['./general-material.component.scss']
})
export class GeneralMaterialComponent implements OnInit{
  generalDataError: string = "";
  public generalForm: FormGroup; // Declaración del formulario
  private updateIntervalMinutes = 3;
  private updateIntervalMillis = this.updateIntervalMinutes * 60 * 1000;
  private userActivitySubscription: Subscription | undefined;


  constructor(private tokenService: TokenService, private authService: AuthService,
    private inactivityService: InactivityService, private loansAppService:LoansApplicationService,
    private formBuilder:FormBuilder){

      this.generalForm = this.formBuilder.group({
        identification: ['', Validators.required],
        identificationType: ['', Validators.required],
        name:['', Validators.required],
        lastname:['', Validators.required],
        genre:['', Validators.required],
        birthdate:['',Validators.required],
        nationality:['', Validators.required],
        requestedAmount:['', Validators.required],
        city:['', Validators.required],
        state:['', Validators.required],
        address:['', Validators.required],
        apartment:['', Validators.required],
        zipcode:['', Validators.required],
        phone:['', Validators.required]

      })
    }

    createGeneralData() {
      if (this.generalForm.valid) {
        const selectedIdentificationType = this.generalForm.get('identificationType')?.value;
        const genreValue = this.generalForm.get('genre')?.value;
        let custumerId = '';
        const id = this.tokenService.getCustomersUuId();
        if(id != null){
          custumerId = id;
        }
        // Crea el objeto GeneralDataRequest y asigna los valores
        const generalDataRequest: GeneralDataRequest = {
          identification: this.generalForm.get('identification')?.value,
          identificationType: selectedIdentificationType,
          name: this.generalForm.get('name')?.value,
          lastname: this.generalForm.get('lastname')?.value,
          genre: genreValue,
          birthdate: this.generalForm.get('birthdate')?.value,
          nationality: this.generalForm.get('nationality')?.value,
          loanApplicationId: '',
          requestedAmount: this.generalForm.get('requestedAmount')?.value,
          city: this.generalForm.get('city')?.value,
          state: this.generalForm.get('state')?.value,
          address: this.generalForm.get('address')?.value,
          apartment: this.generalForm.get('apartment')?.value,
          zipcode: this.generalForm.get('zipcode')?.value,
          phone: this.generalForm.get('phone')?.value,
          customersUuid: custumerId
        };


        this.loansAppService.saveGeneralData(generalDataRequest).subscribe({
          next: (response) => {
            this.tokenService.setLoanApplicationId(response.loanApplicationId);
            console.log(response);
          },
          error: (err) => {
            console.log(err);
          },
          complete: () => {
            console.log('Datos guardados correctamente');
          },
        });
      } else {
        alert('Error al cargar datos');
        this.generalForm.markAllAsTouched();
      }
    }
    customerId = this.tokenService.getCustomersUuId();



  ngOnInit(): void {
    if (this.tokenService.isLoggued()) {
      // Actualizar token cada 3 minutos
      this.userActivitySubscription = interval(this.updateIntervalMillis).subscribe(() => {
        this.updateToken();
      });
      this.inactivityService.startInactivityTimer();
    }
  }



  ngOnDestroy(): void {
    // Cancelar la suscripción cuando se destruye el componente
    if (this.userActivitySubscription) {
      this.userActivitySubscription.unsubscribe();
    }
  }

  private updateToken(): void {
    this.authService.getCurrentSession().subscribe(
      updatedSession => {
        console.log("Token viejo: " + this.tokenService.getToken())
        this.tokenService.setToken(updatedSession.token);
        console.log("Token nuevo:" + this.tokenService.getToken());
      },
      error => {
        console.error('Error al actualizar el token:', error);
      }

    )
  }

  getButtonClass() {
    // Devuelve la clase CSS correspondiente según el estado del formulario
    return this.generalForm.invalid ? 'button-disabled' : '';
  }

}
