import React from 'react';
import GroupActivityAdmin from './GroupActivityAdmin';

export default function Leaderboard({api,token,refreshKey,audience='INDIVIDUAL',onAudienceChange=()=>{},onRefresh=()=>{}}){
 return <div className="leaderboard-page"><GroupActivityAdmin api={api} token={token} refreshKey={refreshKey} audience={audience} onAudienceChange={onAudienceChange} onRefresh={onRefresh}/></div>;
}
