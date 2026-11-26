import React from 'react';
import {ShieldCheck} from 'lucide-react';
import Button from './Button';

export default function UserCell({ user, onClick, showId = false }) {
 const initials=(user.name || 'User').trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();
 return <Button className="record-user-link user-cell" onClick={onClick}><span className="user-cell-avatar" aria-hidden="true">{user.profileImageUrl ? <img src={user.profileImageUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/> : initials}</span><span className="user-cell-info"><strong>{user.name}{user.isAdmin&&<span className="user-admin-badge"><ShieldCheck size={11}/>Admin</span>}</strong><small className={showId?'public-user-id':''}>{showId?user.publicId:user.email}</small></span></Button>;
}
