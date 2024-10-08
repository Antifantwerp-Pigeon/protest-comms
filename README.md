# Protest Comms

- Create an (optionally public) page with all **slogans** for the protest, highlighting whichever is **currently being chanted**
- Allow protest chaperones to communicate need for **waiting**, **medical intervention** or **support against police brutality**

## Privacy/security note
Note that this is primarily designed for legal protests. If you're at an illegal one, you probably do not want to have your phone on you, nor do you want a protest website in your search history. This site's [base design decisions](#base-design-decisions) are geared towards keeping everything somewhat private, but keep in mind that some things (like Google search history keeping or a non-VPN-protected connection showing which websites you visit to your ISP) that are inherent with any website. It should also be noted that - until further notice - the data is stored unencrypted in Pocketbase.

## How-To
### Run/build website locally
This requires [git](https://git-scm.com/), [Node.js](https://nodejs.org/), and [Yarn](https://yarnpkg.com/getting-started/install) to be installed. Ideally, you have an Pocketbase server as well.

```bash
# Get a local copy of the repository
git clone https://github.com/Antifantwerp/protest-comms
cd protest-comms

# Install dependencies
yarn install
```

> At this point, rename [.env.example](.env.example) to .env and change the value(s) to match your setup.
> Alternatively, set the values as environment variables.

```bash
# Run parcel live server
yarn start

# Build static website to dist/
yarn build

# Build for another domain
parcel build --public-url https://protest.example.com/
```

### Server/pocketbase setup
This requires a running [Pocketbase](https://pocketbase.io/) instance, with a configured *Admin account*.
See [the instructions to set up Pocketbase](https://pocketbase.io/docs/).

1. Build the website files (see `dist/` folder after running `yarn build`),
2. Serve the files from step 1 somewhere (through GitHub Pages, a webserver...). Any static host will do!
3. Navigate to `https://example.com/admin.html` (replacing the url with your pocketbase url)
4. Log in using your Pocketbase admin credentials
5. Scroll down to *Admin settings*. Use the *Change PIN* panel to change the PIN for both *Chaperone* and *Attendee*. This will also create the users in case they don't already exist!
6. Enable/disable *Require PIN for viewing slogans* as wanted, and then press *Setup collections*. This will create the `slogans` and `ping` collections.
7. Done! You and *chaperones* can both add/edit/remove slogans as wanted.

## Explanation
### The (chaperone) userlend system
> Note: this is all technical information, and not something you have to deal with as a user. This is added for documentation & clarity

During the first run with protest-comms, it became clear that perhaps having multiple people logged into the same account at the same time could give some issues. However:
1. Creating multiple custom chaperone accounts would require way more manual setup, as well as immensely slow things down when someone unexpectedly joins the chaperones.
2. Having individual nicknames would allow more clear communication between chaperones.
3. The one-chaperone-account system allowed everyone to log in with the same pin. Having them have to enter an already-existing username would
slow things down (e.g. 1.)
4. An invite system or allowing chaperones to create new chaperones on the fly would also slow things down (e.g. 1.)

So instead of that, the userlend system has been made!
1. When the chaperone password is set, all existing chaperone users will be removed
2. Chaperone password setting now includes an input for entering *how many* chaperones you want there to be at maxmimum. This creates `chaperone0`, `chaperone1`, ... until the provided amount has been reached. They all have `is_chaperone` set to true
3. The `users` collection now allows non-verified listing for users that start with the name `chaperone`
4. Chaperones enter their desired username and the chaperone PIN set by the admins
5. First of all, the login will be tried exactly as provided: desired username & pin
6. If this doesn't work, list all generated chaperone accounts (see 2. & 3.) 
7. Iterate over the temporary accounts and try to log in
8. If the password is correct, the chaperone account will update its own username to the desired username. This allows for logging back into the lended account (see 5.)
9. If the password is wrong, it'll simply not work, as expected. 

### Admin accounts are separate from chaperones
When there was only one active currentslogan (e.g. no per-chaperone), admins could also change current slogans. However, admin accounts are not used in Pocketbase users collection field relations, so the previously common controls from chaperone & admin have been moved directly into chaperone and removed from admin.

### Permissions


### Base design decisions
- Have as little moving parts as possible. A static-built website using [Parcel](https://parceljs.org/) (which allows whichever templating engines and local npm imports to be used), connected to a live database ([Pocketbase](https://pocketbase.io/))
- One deployment per organisation. This should not be a central hub for anyone to use, but instead a self-maintained tool
- No external links. The only requests this website should make is to the Pocketbase server. Any dependencies should be served locally


## License
The field of ethical software licensing is still growing. If down the road some vetted/concrete examples pop up, it might be worth moving towards for projects. But until that happens, all code is licensed under the [MIT License](LICENSE).

