import React from 'react';
import {AlertTriangle} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({open,title,message,confirmLabel='Confirm',cancelLabel='Cancel',tone='danger',busy=false,Icon=AlertTriangle,onConfirm,onClose}){
 if(!open)return null;
 return <Modal className="hg-confirm-dialog" labelledBy="hg-confirm-title" describedBy="hg-confirm-message" onClose={onClose} busy={busy}>
  <div className="hg-confirm-content"><span className={`hg-confirm-icon ${tone}`}><Icon size={20}/></span><h2 id="hg-confirm-title">{title}</h2><p id="hg-confirm-message">{message}</p><div className="hg-confirm-actions"><Button type="button" className="secondary" disabled={busy} onClick={onClose}>{cancelLabel}</Button><Button type="button" className={tone==='danger'?'danger-button':'primary'} loading={busy} onClick={onConfirm}>{busy?'Please wait…':confirmLabel}</Button></div></div>
 </Modal>;
}
