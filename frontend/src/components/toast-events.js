export function showAppToast(message,tone='info',duration=tone==='info'?0:5000){
 window.dispatchEvent(new CustomEvent('health-admin-toast',{detail:{message,tone,duration}}));
}
