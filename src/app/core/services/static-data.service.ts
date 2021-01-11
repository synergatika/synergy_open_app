import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

import { PaymentList } from '../interfaces/payment-list.interface';
import { ContactList } from '../interfaces/contact-list.interface';
import { GeneralList } from '../interfaces/general-list.interface';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  siteTitle: string = " - Synergy.gr | Εμπορική Κοινότητα Συνεργατικών";

  /**
  * Payments List
  */
  paymentsList: PaymentList[] = [
    {
      bic: 'ETHNGRAA',
      title: 'SUPPORT.PAYMENT_CHOICES.A',
      name: 'NationalBankofGreece',
      icon: '',
      value: '',
      description: '',
    },
    {
      bic: 'PIRBGRAA',
      title: 'SUPPORT.PAYMENT_CHOICES.B',
      name: 'PiraeusBank',
      icon: '',
      value: '',
      description: '',
    },
    {
      bic: 'EFGBGRAA',
      title: 'SUPPORT.PAYMENT_CHOICES.C',
      name: 'EFGEurobankErgasias',
      icon: '',
      value: '',
      description: '',
    },
    {
      bic: 'CRBAGRAA',
      title: 'SUPPORT.PAYMENT_CHOICES.D',
      name: 'AlphaBankAE',
      icon: '',
      value: '',
      description: '',
    },
    // {
    //     bic: 'PAYPAL',
    //     title: 'SUPPORT.PAYMENT_CHOICES.E',
    //     name: 'Paypal',
    //     icon: '',
    //     value: '',
    //     description: '',
    // },
    {
      bic: 'PAYPAL.ME',
      title: 'SUPPORT.PAYMENT_CHOICES.F',
      name: 'PayPal.Me',
      icon: '',
      value: '',
      description: '',
    }
  ];


  /**
   * Contacts List
   */
  contactsList: ContactList[] = [
    // {
    //     slug: 'Phone',
    //     title: 'FIELDS.PROFILE.CONTACT_CHOICES.A',
    //     name: 'Phone',
    //     icon: 'phone',
    //     value: '',
    //     description: '',
    // }
    {
      slug: 'WEB',
      prefix: 'https://www.',
      title: 'FIELDS.PROFILE.CONTACT_CHOICES.B',
      name: 'Website',
      icon: 'web',
      value: '',
      description: '',
    },
    {
      slug: 'FB',
      prefix: 'https://www.facebook.com/',
      title: 'FIELDS.PROFILE.CONTACT_CHOICES.C',
      name: 'Facebook',
      icon: 'facebook-box',
      value: '',
      description: '',
    },
    {
      slug: 'TW',
      prefix: 'https://twitter.com/',
      title: 'FIELDS.PROFILE.CONTACT_CHOICES.D',
      name: 'Twitter',
      icon: 'twitter-box',
      value: '',
      description: '',
    },
    {
      slug: 'IG',
      prefix: 'https://www.instagram.com/',
      title: 'FIELDS.PROFILE.CONTACT_CHOICES.E',
      name: 'Instagram',
      icon: 'instagram',
      value: '',
      description: '',
    },
    {
      slug: 'YT',
      prefix: 'https://www.youtube.com/channel/',
      title: 'FIELDS.PROFILE.CONTACT_CHOICES.F',
      name: 'Youtube',
      icon: 'youtube',
      value: '',
      description: '',
    },
  ];

  /**
  * Sectors List
  */
  sectorList: GeneralList[] = [
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.A',
      value: 'B2B Services & Other Goods and Services',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.B',
      value: 'Durables',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.C',
      value: 'Durables (Technology)',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.D',
      value: 'Education',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.E',
      value: 'Food',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.F',
      value: 'Hotels, Cafés and Restaurants',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES.G',
      value: 'Recreation and Culture',
    },
    {
      title: 'FIELDS.PROFILE.SECTOR_CHOICES._',
      value: 'Other',
    },
  ];

  owlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    margin: 30,
    nav: true
  }

  
  public get getSiteTitle() {
    return this.siteTitle;
  }

  public get getPaymentsList(): PaymentList[] {
    return this.paymentsList;
  };

  public get getContactsList(): ContactList[] {
    return this.contactsList;
  };

  public get getSectorList() {
    return this.sectorList;
  }

  public get getOwlOprions() {
    return this.owlOptions;
  };

}