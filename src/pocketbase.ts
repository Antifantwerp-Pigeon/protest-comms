import PocketBase from "pocketbase";
import {success, error, warning, init as initNotyf} from "./notify";

let pb: PocketBase;


async function loginWithPassword(e) {
    e.preventDefault();
    
    const username =  $("#username").val();
    const passInput: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    const tryAdminLogin = $("#try-admin-login").is(":checked")

    if (passInput.value) {
        
        const login = !tryAdminLogin ? pb.collection("users") : pb.admins;
        try {
            // @ts-ignore
            const data = await login.authWithPassword(username, passInput.value);
        } catch (err) {
            error(err.response.message);
            return;
        }

        
        success("Logged in!")
        const loginForm = (document.getElementById("loginForm") as HTMLElement);
        loginForm.style.display = "none";
        loggedIn();
    }
}

const slogans = $("#slogans ol") // TODO move up
function addSlogan(sloganRecord) {
    slogans.append(`<li id="${sloganRecord.id}">${sloganRecord.text}</li>`)
}

function updateSlogan(sloganRecord) {
    $("#" + sloganRecord.id).text(sloganRecord.text)
}

function deleteSlogan(sloganRecord) {
    $("#" + sloganRecord.id).remove();
}

async function loggedIn() {
    // Remove initial hiding class
    // Hide loading & login
    $("#loading").hide();
    $("#loginForm").hide();        


    try {
        (await pb.collection("slogans").getFullList()).forEach(addSlogan);


        pb.collection("slogans").subscribe("*", function(data) {
            switch (data.action) {
                case "create":
                    addSlogan(data.record);
                    break;
                
                case "update":
                    updateSlogan(data.record);
                    break;

                case "delete":
                    deleteSlogan(data.record);
                    break;

                default:
                    throw new Error("Unimplemented action: " + data.action)
            }
        });

        pb.collection("ping").subscribe("*", function(data) {
            if (data.action == "update") {
                const currentSlogan = data.record.currentslogan;
                const message = data.record.message;
                if (currentSlogan) {
                    $(".current-slogan").removeClass("current-slogan");
                    $("#" + currentSlogan).addClass("current-slogan")
                }
                if (message) {
                    let urgency = message.toLowerCase().split(" ")[0].replace(":", "")
                    switch (urgency) {
                        case "incoming":
                            success(message);
                            break;
                        case "when":
                            warning(message);
                            break;
                        case "urgent":
                            error(message);
                            break;
                        default:
                            console.log("Couldn't determine urgency, send as warning")
                            warning(message)
                            break;
                    }
                }
            }
        })
    } catch (err) {
        console.error("Error while retrieving slogans" + (pb.authStore.isAdmin ? `. Please go to ${window.location.origin}/maintainer.html, use the setup collections button` : ""))
        console.error(err);
    }
    

    // Show slogans for everyone logged in
    $('#slogans').show(400)

    // Show settings to chaperone && admins
    let usr = pb.authStore.model ? pb.authStore.model.username : "";
    if (usr == "chaperone" || pb.authStore.isAdmin) {
        $("#send-signal").show(400)
        $("#settings").show(400)
    }

    if (pb.authStore.isAdmin) {
        $("#admin-settings").show()
    }
}

function init(justReturnPb=false, tryWithoutAuth=false): PocketBase {
    // Init notifications
    initNotyf();

    const pocketBaseUrl = process.env.POCKETBASE_URL;
    if (!pocketBaseUrl) {
        alert("No database url could be found. Please report this to the site admin!");
        return pb;
    }
    pb = new PocketBase(pocketBaseUrl);

    if (justReturnPb) {
        return pb;
    }

    $(window).on("load", async function() {
        // Hide everything
        $("main").children().hide();
    
        $("main").removeClass("loading");
        
        // If not logged in
        if (!pb.authStore.isValid) {
            // For index/attendee page, still try without auth
            if (tryWithoutAuth) {
                const data = await pb.collection("slogans").getList(1, 1);  // Return 1
                if (data.totalItems == 0) {
                    warning("No slogans could be loaded. Are you logged in?");
                } else {
                    // TODO: cleaner solution
                    loggedIn();
                    return pb;
                }
            }

            // Remove initial hiding class
            $("main").removeClass("loading");
            // Hide all shown elements
            $("main > *").hide();
            // Enable & show login
            $("#loginForm").on("submit", loginWithPassword).show();
        }
        // If logged in
        else {
            loggedIn();
        }
        
    });
    
    return pb;
}

export default init;
