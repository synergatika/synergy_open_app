import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { tap, takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OpenDataService } from '../../../core/services/open-data.service';
import { ActivatedRoute } from '@angular/router';
import { MicrocreditCampaign } from '../../../core/models/microcredit-campaign.model';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
// RxJS
import { Observable, of } from 'rxjs';
// Translate
import { TranslateService } from '@ngx-translate/core';
import { StaticDataService } from 'src/app/core/services/static-data.service';
import Swal from 'sweetalert2';
import { PaymentDetails } from 'src/app/core/models/payment-details.model';

// import {
//   IPayPalConfig,
//   ICreateOrderRequest
// } from 'ngx-paypal';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'sng-support-window',
  templateUrl: './support-window.component.html',
  styleUrls: ['./support-window.component.scss']
})
export class SupportWindowComponent {
  @Input() campaign: MicrocreditCampaign;
  @Output() closeModalEvent = new EventEmitter<boolean>();

  public paymentsList: any[];
  paymentDetails: PaymentDetails;

  public canSupport: boolean = false;

  oneClickToken: any;
  showPaypalButton: boolean = false;
  showAddStep: boolean = true;
  showSubStep: boolean = true;

  public step: boolean = false;
  tempAmount: number = 0;

  partner_id: string;
  campaign_id: string;
  registrationForm: FormGroup;
  supportingForm: FormGroup;
  validator: any;

  private routeSubscription: any;
  loading: boolean = false;
  private unsubscribe: Subject<any>;

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService,
    private fb: FormBuilder,
    private titleService: Title,
    private openDataService: OpenDataService,
    private staticDataService: StaticDataService,
  ) {
    this.validator = this.staticDataService.getValidators.user;
    this.paymentsList = this.staticDataService.getPaymentsList;
    this.unsubscribe = new Subject();
  }



  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.partner_id = params['partner_id'];
      this.campaign_id = params['campaign_id'];
      this.checkSupport();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.loading = false;
  }

  checkSupport() {
    const now = new Date();
    const seconds = parseInt(now.getTime().toString());

    this.titleService.setTitle(this.campaign.title + this.staticDataService.getSiteTitle);
    this.canSupport = (this.campaign.startsAt < seconds) && (this.campaign.expiresAt > seconds);
    this.initRegistrationForm();
    this.initSupportingForm();
  }

  initRegistrationForm() {
    this.registrationForm = this.fb.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email,
        Validators.minLength(this.validator.email.minLength),
        Validators.maxLength(this.validator.email.maxLength)
      ])
      ],
    });
  }

  initSupportingForm() {
    const currentMethodsArray = (this.campaign.partner.payments).map(a => a.bic);
    const validatePaymentList = this.paymentsList.filter(function (el) {
      return currentMethodsArray.includes(el.bic);
    });
    this.paymentsList = validatePaymentList;
    this.supportingForm = this.fb.group({
      amount: ['', Validators.compose([
        Validators.required,
        (control: AbstractControl) => Validators.min(this.campaign.minAllowed)(control),
        (control: AbstractControl) => Validators.max((this.campaign.maxAllowed) > 0 ? this.campaign.maxAllowed : this.campaign.maxAmount)(control)
      ])
      ],
      method: ['', Validators.compose([
        Validators.required,
      ])
      ]
    });
    const controls = this.supportingForm.controls;
    controls['amount'].setValue(this.campaign.minAllowed);
    this.showSubStep = false;
    controls['method'].setValue(this.paymentsList[0].bic);
    this.tempAmount = this.campaign.minAllowed;
    this.onPaymentChange(this.paymentsList[0].bic)
  }

  oneClickRegistration() {
    this.openDataService.oneClickRegistration(this.registrationForm.controls.email.value)
      .pipe(
        tap(
          data => {
            console.log(data);
            this.oneClickToken = data;
            this.oneClickBalance();
          },
          error => {
            Swal.fire(
              this.translate.instant('SUPPORT.ERROR.REGISTRATION'),
              this.translate.instant(error),
              'error'
            );
            console.log('error');
          }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.loading = false;
          this.cdRef.markForCheck();
        })
      )
      .subscribe();
  }

  oneClickBalance() {
    this.openDataService.oneClickBalance(this.campaign.partner._id, this.campaign._id, this.oneClickToken.oneClickToken)
      .pipe(
        tap(
          data => {
            console.log(data);
            if (parseInt(data.initialTokens) + this.campaign.minAllowed >= this.campaign.maxAmount) {
              let message = 'SUPPORT.ERROR.OVER_MAX_AMOUNT';
              Swal.fire(
                this.translate.instant('SUPPORT.ERROR.TITLE'),
                this.translate.instant(message),
                'error'
              );
            } else if (this.campaign.maxAmount - parseInt(data.initialTokens) < this.campaign.maxAllowed) {
              this.step = true;
              const controls = this.supportingForm.controls;
              controls["amount"].setValidators([
                Validators.required,
                (control: AbstractControl) => Validators.min(this.campaign.minAllowed)(control),
                (control: AbstractControl) => Validators.max(this.campaign.maxAmount - parseInt(data.initialTokens))(control)
              ]);
              controls['amount'].updateValueAndValidity()
            } else {
              this.step = true;
            }
          },
          error => {
          }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.loading = false;
          this.cdRef.markForCheck();
        })
      )
      .subscribe();
  }

  oneClickSupport(controls: { [x: string]: AbstractControl; amount?: any; method?: any; }) {
    this.openDataService.oneClickSupport(this.campaign.partner._id, this.campaign._id, this.oneClickToken.oneClickToken,
      controls.amount.value, controls.method.value)
      .pipe(
        tap(
          data => {
            (data);
            this.paymentDetails = data;
            //this.support.how = data.how;
            this.closeModalEvent.emit(false);

            this.paymentDetails['how'] = (this.paymentDetails.method == 'store') ? { title: '', value: '' } : {
              title: this.paymentsList.filter((el) => {
                return el.bic == this.paymentDetails.method
              })[0].title,
              value: this.campaign.partner.payments.filter((el) => {
                return el.bic == this.paymentDetails.method
              })[0].value
            }

            if (this.paymentDetails.method == 'store') {
              Swal.fire({
                title: this.translate.instant('SUPPORT.SUCCESS.TITLE'),
                html: this.translate.instant('SUPPORT.SUCCESS.PAYMENT_ID') + ": " + this.paymentDetails.payment_id + "<br><br>" +
                  this.translate.instant('SUPPORT.SUCCESS.INSTRUCTIONS') + ": " + this.translate.instant('SUPPORT.STORE') + "<br>" +
                  this.campaign.partner.address.street + ", " + this.campaign.partner.address.postCode + " " + this.campaign.partner.address.city,
                icon: 'success'
              })
            } else if (this.paymentDetails.method == 'PAYPAL') {
              Swal.fire({
                title: this.translate.instant('SUPPORT.SUCCESS.TITLE'),
                html: this.translate.instant('SUPPORT.SUCCESS.PAYMENT_ID') + ": " + this.paymentDetails.payment_id + "<br><br>" +
                  this.translate.instant('SUPPORT.SUCCESS.INSTRUCTIONS') + ": " + this.translate.instant('SUPPORT.PAYPAL') + "<br>" +
                  this.translate.instant(this.paymentDetails.how['title']) + ": " + this.paymentDetails.how['value'],
                icon: 'success'
              })
            } else {
              Swal.fire({
                title: this.translate.instant('SUPPORT.SUCCESS.TITLE'),
                html: this.translate.instant('SUPPORT.SUCCESS.PAYMENT_ID') + ": " + this.paymentDetails.payment_id + "<br><br>" +
                  this.translate.instant('SUPPORT.SUCCESS.INSTRUCTIONS') + ": " + this.translate.instant('SUPPORT.BANK') + "<br>" +
                  this.translate.instant(this.paymentDetails.how['title']) + ": " + this.paymentDetails.how['value'],
                icon: 'success'
              })
            }

          },
          error => {
            let message = 'SUPPORT.ERROR.SUPPORTING';
            if (error.status === 404) message = 'SUPPORT.ERROR.' + error.error.message.split('Not Found: ')[1];
            Swal.fire(
              this.translate.instant('SUPPORT.ERROR.TITLE'),
              this.translate.instant(message),
              'error'
            );
            console.log('error');
          }),
        takeUntil(this.unsubscribe),
        finalize(() => {
          this.loading = false;
          this.cdRef.markForCheck();
        })
      )
      .subscribe();
  }

  onSubmitRegistration() {
    if (this.loading) return;
    this.loading = true;

    const controls = this.registrationForm.controls;
    /** check form */
    if (this.registrationForm.invalid) {
      Object.keys(controls).forEach(controlName =>
        controls[controlName].markAsTouched()
      );
      this.loading = false;
      return;
    }

    this.oneClickRegistration();
  }

  onSubmitSupporting() {

    if (this.loading) return;
    this.loading = true;

    const controls = this.supportingForm.controls;
    /** check form */
    if (this.supportingForm.invalid) {
      Object.keys(controls).forEach(controlName =>
        controls[controlName].markAsTouched()
      );
      this.loading = false;
      return;
    }

    this.oneClickSupport(controls);

  }

  onChangeAmount(action: boolean) {
    const controls = this.supportingForm.controls;
    this.tempAmount = (action) ? (controls.amount.value + this.campaign.stepAmount) : (controls.amount.value - this.campaign.stepAmount);

    this.showAddStep = (this.tempAmount >= this.campaign.maxAllowed) ? false : true;
    this.showSubStep = (this.tempAmount <= this.campaign.minAllowed) ? false : true;

    controls['amount'].setValue(this.tempAmount);
    this.onPaymentChange(controls.method.value)
  }

  // addStep() {
  // 	const controls = this.supportingForm.controls;
  // 	this.tempAmount = controls.amount.value + this.campaign.stepAmount;
  // 	if (this.tempAmount <= this.campaign.maxAllowed) {
  // 		controls['amount'].setValue(this.tempAmount);
  // 	}
  // 	this.onPaymentChange(controls.method.value)
  // }

  // subStep() {
  // 	const controls = this.supportingForm.controls;
  // 	this.tempAmount = controls.amount.value - this.campaign.stepAmount;
  // 	if (this.tempAmount >= this.campaign.minAllowed) {
  // 		controls['amount'].setValue(this.tempAmount);
  // 	}
  // 	this.onPaymentChange(controls.method.value)
  // }

  onPreviousStep() {
    this.step = false;
  }

  onPaymentChange(payment: string) {
    // if (payment === 'PAYPAL') {
    //   this.showPaypalButton = true;
    //   this.initConfig(this.tempAmount, this.campaign.partner_payments.filter((el) => {
    //     return el.bic == payment
    //   })[0].value);
    // } else {
    this.showPaypalButton = false;
    // }
  }

  // public payPalConfig?: IPayPalConfig;

  // private initConfig(amount: number, payee: string): void {

  //   const controls = this.supportingForm.controls;
  //   if (this.supportingForm.invalid) {
  //     Object.keys(controls).forEach(controlName =>
  //       controls[controlName].markAsTouched()
  //     );
  //     return;
  //   }

  //   const paymentDetails = {
  //     amount: amount.toString(),
  //     payee: 'member@synergy.io', //payee,
  //     item_name: this.campaign.title,
  //     item_quantity: (this.campaign.quantitative) ? amount.toString() : '1'
  //   }
  //   this.payPalConfig = {
  //     currency: 'EUR',
  //     clientId: 'AZTnZ-SdPrcXmAIWdQHEtOuCk1u8Y9CSAerEDxwkokKydC68Si2MdDk1kKzBkij0T1R8C78896SeCEKV',
  //     createOrderOnClient: (data) => <ICreateOrderRequest>{
  //       intent: 'CAPTURE',
  //       purchase_units: [
  //         {
  //           amount: {
  //             currency_code: 'EUR',
  //             value: paymentDetails.amount,
  //             breakdown: {
  //               item_total: {
  //                 currency_code: 'EUR',
  //                 value: paymentDetails.amount,
  //               }
  //             }
  //           },
  //           payee: {
  //             //merchant_id: 'JCE5DLUCP5L38',
  //             email_address: paymentDetails.payee//'partner@synergy.io'
  //           },
  //           items: [
  //             {
  //               name: paymentDetails.item_name,
  //               quantity: '1',
  //               category: 'DIGITAL_GOODS',
  //               unit_amount: {
  //                 currency_code: 'EUR',
  //                 value: paymentDetails.amount,
  //               },
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     advanced: {
  //       commit: 'true'
  //     },
  //     style: {
  //       label: 'paypal',
  //       layout: 'horizontal',
  //       size: 'responsive',
  //     },
  //     onApprove: (data, actions) => {
  //       console.log('onApprove - transaction was approved, but not authorized', data, actions);
  //       actions.order.get().then((details: any) => {
  //         console.log('onApprove - you can get full order details inside onApprove: ', details);
  //       });
  //     },
  //     onClientAuthorization: (data) => {
  //       console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
  //       this.onSubmitSupporting();
  //       //	this.showSuccess = true;
  //     },
  //     onCancel: (data, actions) => {
  //       console.log('OnCancel', data, actions);
  //     },
  //     onError: err => {
  //       console.log('OnError', err);
  //     },
  //     onClick: (data, actions) => {

  //       console.log('onClick', data, actions);


  //     },
  //   };
  // }




  /**
   * Checking control validation
   *
   * @param controlName: string => Equals to formControlName
   * @param validationType: string => Equals to valitors name
   */
  isRegistrationControlHasError(controlName: string, validationType: string): boolean {
    const control = this.registrationForm.controls[controlName];
    if (!control) {
      return false;
    }

    const result =
      control.hasError(validationType) &&
      (control.dirty || control.touched);
    return result;
  }

  /**
  * Checking control validation
  *
  * @param controlName: string => Equals to formControlName
  * @param validationType: string => Equals to valitors name
  */
  isSupportingControlHasError(controlName: string, validationType: string): boolean {
    const control = this.supportingForm.controls[controlName];
    if (!control) {
      return false;
    }

    const result =
      control.hasError(validationType) &&
      (control.dirty || control.touched);
    return result;
  }
}
