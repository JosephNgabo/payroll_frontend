import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ModalModule],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent {
  @Input() transactions: any[] = [];
  modalRef?: BsModalRef;

  constructor(private modalService: BsModalService) {}

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }
}
