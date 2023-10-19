import { getMessaging, getToken} from 'firebase/messaging';


export const requestForToken = async () => {
  try {
        const currentToken = await getToken(getMessaging(), { vapidKey: "BD_iMVRSet4AzlKvmgE3AJfAuaa_LyU2zmOXK_5iI4VBaondpjvAr_duDpx6PHGCB0SXe3y5elKO0MjXO_uU-I0" });
        if (currentToken) {
            console.log('current token for client: ', currentToken);
        } else {
            // Show permission request UI
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
    }
};
