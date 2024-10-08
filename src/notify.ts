import { Notyf } from "notyf";
import { ClientResponseError } from "pocketbase";

/**
 * Helper functions for universal pop-ups and error logging
 */

let notyf: Notyf;
const UNIDENTIFIED_ERROR_MESSAGE = "Unidentified error! See the logs for more info";

// Having a seperate init function allows this only to be called once in the whole codebase,
// whilst still allowing other files to import and use the success, warning... functions
function init() {
    notyf = new Notyf({
        position: {
            x: "center",
            y: "top"
        },
        duration: 5000,
        dismissible: true,
        types: [
            {
                type: "error",
                ripple: false,
            },
            {
                type: "success",
                ripple: true,
            },
            {
                type: "warning",
                ripple: false,
                className: "black-text",
                background: "#FFEA53"
            },
            {
                type: "info",
                ripple: true,
                background: "#0505FF"
            }
        ]
    });
}

function success(msg) {
    return notyf.success(msg);
}
function warning(msg) {
    return notyf.open({
        type: "warning",
        message: msg
    });
}
function info(msg) {
    return notyf.open({
        type: "info",
        message: msg
    });
}
function error(msg) {
    return notyf.error(msg);
}

function _unidentifiedError(err: Error) {
    // The Pocketbase errors embed weirdly in console. For full info, log a stringify
    console.log(JSON.stringify(err));
    return UNIDENTIFIED_ERROR_MESSAGE;
}

function reportError(label: string, err: Error) {
    let message = "";
    if (err instanceof ClientResponseError) {
        const errData = err.response.data;
        const errDataKeys = Object.keys(errData);

        if (errDataKeys.length < 0) {
            errDataKeys.forEach((key) => {
                switch(key) {
                    case "passwordConfirm":
                        message = "PIN codes do not match!"
                        break;
                    default:
                        message = _unidentifiedError(err);
                        break;
                }
            }) 
        } else {
            message = err.message;
        }
    } else {
        message = _unidentifiedError(err);
    }
    error(label + ": " + message);
}

export {init,success,warning,error,info,reportError}