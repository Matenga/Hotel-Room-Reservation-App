import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuotationPage } from './quotation';

@NgModule({
  declarations: [
    QuotationPage,
  ],
  imports: [
    IonicPageModule.forChild(QuotationPage),
  ],
  exports: [
    QuotationPage
  ]
})
export class QuotationPageModule {}
