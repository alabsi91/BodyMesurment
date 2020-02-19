let isLogged;
let isGuest;
S = function (id) {
	const nodes = document.querySelectorAll(id)
	if (nodes.length > 1) {
		return {
			css: function css(p, v) {
				for (let i = 0; i < nodes.length; i++) {
					nodes[i].style[p] = v
				}
				return this
			},
			text: function text(v) {
				for (let i = 0; i < nodes.length; i++) {
					nodes[i].innerHTML = v
				}
				return this
			}
		}
	} else {
		return nodes[0]
	}
}
gsap.to('#title1', { duration: 0.9, bottom: "45%" })
window.addEventListener("load", _ => {
	if (window.localStorage.getItem('lan') === "ar" || window.navigator.language.includes("ar") && window.localStorage.getItem('lan') === null) {
		changeLan();
		S("#arabic").innerHTML = "English"
	}
	bodymovin.loadAnimation({
		container: S('#loading'),
		renderer: 'svg',
		loop: true,
		autoplay: true,
		path: 'data.json'
	});
	tipAnimate("#bmitip")("#bmrtip")("#ibwtip")("#lbmtip")("#bfptip")("#whtrtip")("#tbwtip")("#necktip")("#waisttip")("#hiptip");

	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	if (!window.indexedDB) {
		S("#Guest").style.display = "none"
	}

	databaseExists("UserData", isYes => {
		if (isYes) {
			isGuest = true
			indexedDB.open("UserData").onsuccess = event => {
				const db = event.target.result;
				const objStore = db.transaction("Guest").objectStore("Guest");
				objStore.getAll().onsuccess = event => {
					user = event.target.result[0];
					toggle("#page4", 0.25, "fade")
					toggle("#welcomePage", 0.25, "fade")
					S("#profile").style.display = "none"
					if (user.skipping === true) {
						bmi();
						HarrisBenedictBMR();
						activityMultipier();
						ibwBroca(); ""
						lbmBoer();
						tbw();
						S("#card3").style.display = "none";
						S("#card5").style.display = "none";
					} else {
						S("#card3").style.display = "block";
						S("#card5").style.display = "block";
						bmi();
						HarrisBenedictBMR();
						activityMultipier();
						whtr();
						ibwBroca();
						BFPnavy();
						lbmBoer();
						tbw();
					}
				};
			};
		}
	});

})
function databaseExists(dbname, callback) {
	const req = indexedDB.open(dbname);
	let existed = true;
	req.onsuccess = _ => {
		req.result.close();
		if (!existed) {
			indexedDB.deleteDatabase(dbname);
		}
		callback(existed);
	}
	req.onupgradeneeded = _ => {
		existed = false;
	}
};
const firebaseConfig = {
	apiKey: "AIzaSyB2zTBz8t8dpSfNpPDccAQ2tWUzvsHQs18",
	authDomain: "body-calculators.firebaseapp.com",
	databaseURL: "https://body-calculators.firebaseio.com",
	projectId: "body-calculators",
	storageBucket: "body-calculators.appspot.com",
	messagingSenderId: "455747607182",
	appId: "1:455747607182:web:584d9bea987fa5773247df",
	measurementId: "G-KXDFTMR718"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();
const ui = new firebaseui.auth.AuthUI(auth);
const db = firebase.firestore();
// enable offline data
db.enablePersistence();
// check if logged in
auth.onAuthStateChanged(users => {
	if (users) {
		// logged in
		isLogged = true;
		S('#firebaseui-auth-container').style.display = 'none';
		S('#loading').style.display = 'block';
		// get user pic & name
		const profileImg = auth.currentUser.providerData.map(e => e.photoURL)[0]
		const displayName = auth.currentUser.providerData.map(e => e.displayName)[0]
		const email = auth.currentUser.providerData.map(e => e.email)[0]
		S('#profileImg').style.backgroundImage = `url(${profileImg})`
		S('#userName').innerHTML = displayName;
		// check if data exists
		const userUid = auth.currentUser.uid;
		const docRef = db.collection("users").doc(`${email} ${userUid}`);
		docRef.get().then(doc => {
			if (doc.exists) {
				// data exists
				user = doc.data()
				toggle("#page4", 0.25, "fade")
				toggle("#welcomePage", 0.25, "fade")
				S("#profile").style.display = "none"
				if (user.skipping === true) {
					bmi();
					HarrisBenedictBMR();
					activityMultipier();
					ibwBroca(); ""
					lbmBoer();
					tbw();
					S("#card3").style.display = "none";
					S("#card5").style.display = "none";
				} else {
					S("#card3").style.display = "block";
					S("#card5").style.display = "block";
					bmi();
					HarrisBenedictBMR();
					activityMultipier();
					whtr();
					ibwBroca();
					BFPnavy();
					lbmBoer();
					tbw();
				}
			} else {
				// No data
				toggle("#welcomePage", 0.25, "fade")
				toggle("#page1", 0.25, "fade")
				S("#profile").style.display = "block"
				S("#back").style.display = "none"
			}
		}).catch(error => console.log("Error getting document:", error));
	} else {
		// not logged in
		isLogged = false
		toggle("#firebaseui-auth-container", 1.5, "fade")
		S('#firebaseui-auth-container').style.display = 'block';
		S('#loading').style.display = 'none';

	}
});
// login ui
const uiConfig = {
	signInFlow: 'popup',
	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		firebase.auth.EmailAuthProvider.PROVIDER_ID,
	],
};
ui.start('#firebaseui-auth-container', uiConfig);
// signOut function
signOut = _ => {
	if (isGuest) {
		indexedDB.deleteDatabase("UserData");
		location.reload();
	} else {
		auth.signOut().then(_ => {
			location.reload();
		}).catch(error => {
			console.log(error)
		});
	}
}
var user = {
	gender: "",
	age: 0,
	weight: 0,
	height: 0,
	waist: 0,
	hip: 0,
	neck: 0,
	activity: "",
	system: "metric",
	skipping: ""
};
const results = {
	bmi: 0,
	bmirange: 0,
	bmr: 0,
	dailykcal: 0,
	whtr: 0,
	whtrRange: 0,
	ibw: 0,
	bfp: 0,
	bfpFM: 0,
	bfpLM: 0,
	bfprange: 0,
	lbm: 0,
	lbmP: 0,
	tbw: 0
};
(function serviceWorker() {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', _ => {
			navigator.serviceWorker.register('/sw.js')
				.then(reg => {
					reg.update();
				}).catch(err => {
					console.log('Regesteration failed ', err)
				})
		})
	}
	let deferredPrompt;
	window.addEventListener('beforeinstallprompt', e => {
		e.preventDefault();
		deferredPrompt = e;
		if (!isLogged) {
			setTimeout(() => {
				toggle("#addToHomePop", 0.1);
			}, 1500);
		}
	});
	S('#addToHomebutt').addEventListener('click', (e) => {
		S("#addToHomePop").style.visibility = "hidden";
		deferredPrompt.prompt();
	});
	document.documentElement.style.setProperty('--inner', window.innerHeight + 'px')
	window.addEventListener('resize', _ => document.documentElement.style.setProperty('--inner', window.innerHeight + 'px'))
}());
bmi = _ => {

	results.bmi = user.system == "metric"
		? user.weight / Math.pow(user.height / 100, 2)
		: (703 * user.weight) / Math.pow(user.height, 2);

	if (results.bmi > 35) {
		gsap.to("#arrow", { duration: 1, left: '243px' })
	} else if (results.bmi < 0) {
		S("#arrow").style.left = -7 + "px";
	} else {
		const bmibar = Math.round(results.bmi * 7.142857);
		gsap.to("#arrow", { duration: 1, left: bmibar + 'px' })
	}
	results.bmi = Number(results.bmi.toFixed(1));
	S("#bmi").innerHTML = results.bmi;
	bmiRange();
};
let bmiRangeST = [
	"Underweight",
	"Normal Weight",
	"Overweight",
	"Obese",
	"Child or Teen",
]
let bmiGoalST = [
	"You Should Gain Some Weight",
	"You Should Sustain Your Weight",
	"You Should Lose Some Weight",
	"You Should Lose Weight",
]
bmiRange = _ => {
	if (results.bmi < 18.5 && user.age >= 20) {
		results.bmirange = bmiRangeST[0];
		S("#bmiRange").style.color = "#d0a50b";
		S("#bmiGoal").innerHTML = bmiGoalST[0];
	} else if (results.bmi >= 18.5 && 24.9 > results.bmi && user.age >= 20) {
		results.bmirange = bmiRangeST[1];
		S("#bmiRange").style.color = "#40ff45";
		S("#bmiGoal").innerHTML = bmiGoalST[1];
	} else if (results.bmi > 25 && 29.9 > results.bmi && user.age >= 20) {
		results.bmirange = bmiRangeST[2];
		S("#bmiRange").style.color = "#d0a50b";
		S("#bmiGoal").innerHTML = bmiGoalST[2];
	} else if (results.bmi > 30 && user.age >= 20) {
		results.bmirange = bmiRangeST[3];
		S("#bmiRange").style.color = "#dc2900";
		S("#bmiGoal").innerHTML = bmiGoalST[3];
	} else {
		results.bmirange = bmiRangeST[4];
	}
	S("#bmiRange").innerHTML = results.bmirange;
};
let kcalST = " kcal/day"
HarrisBenedictBMR = _ => {
	let bmr;
	switch (user.gender) {
		case "male":
			bmr = user.system === "metric"
				? 66.47 + (13.75 * user.weight) + (5.003 * user.height) - (6.755 * user.age)
				: 66.47 + (6.24 * user.weight) + (12.7 * user.height) - (6.755 * user.age);
			break;
		case "female":
			bmr = user.system === "metric"
				? 655.1 + (9.563 * user.weight) + (1.85 * user.height) - (4.676 * user.age)
				: 655.1 + (4.35 * user.weight) + (4.7 * user.height) - (4.7 * user.age);
			break;
	}
	results.bmr = Number(bmr.toFixed(0));
	S("#bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
};
MifflinStJeorBMR = _ => {
	let bmr;
	switch (user.gender) {
		case "male":
			bmr = user.system === "metric"
				? (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5
				: (4.536 * user.weight) + (15.88 * user.height) - (5 * user.age) + 5;
			break;
		case "female":
			bmr = user.system === "metric"
				? (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161
				: (4.3536 * user.weight) + (15.88 * user.height) - (5 * user.age) - 161;
			break;
	}
	results.bmr = Number(bmr.toFixed(0));
	S("#bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
};
activityMultipier = _ => {
	if (user.activity === "sedentary") {
		results.dailykcal = results.bmr * 1.2;
	} else if (user.activity === "light") {
		results.dailykcal = results.bmr * 1.375;
	} else if (user.activity === "moderate") {
		results.dailykcal = results.bmr * 1.55;
	} else if (user.activity === "very") {
		results.dailykcal = results.bmr * 1.725;
	} else if (user.activity === "extra") {
		results.dailykcal = results.bmr * 1.9;
	}
	results.dailykcal = Number(results.dailykcal.toFixed(0));
	S("#intake").innerHTML = `${results.dailykcal}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
};
bmrmethod = _ => {
	if (S("#bmrmethod").value === "harris") {
		HarrisBenedictBMR();
		activityMultipier();
	} else {
		MifflinStJeorBMR();
		activityMultipier();
	}
};
whtr = _ => {
	results.whtr = user.waist / user.height;
	results.whtr = Number(results.whtr.toFixed(2));
	S("#whtr").innerHTML = results.whtr;
	whtrRange();
};
let whtrRangeST = [
	"Extremely Slim",
	"Slim",
	"Healthy",
	"Overweight",
	"Very overweight",
	"Obese",
]
let whtrGoal = [
	"You Should Gain Weight",
	"You Should Gain Some Weight",
	"You Should Sustain Your Weight",
	"You Should Lose Some Weight",
	"You Should Lose Weight",
]
whtrRange = _ => {
	switch (user.gender) {
		case "male":
			if (results.whtr <= 0.34 && user.age >= 20) {
				results.whtrRange = whtrRangeST[0];
				S("#whtrRange").style.color = "#dc2900";
				S("#whtrGoal").innerHTML = whtrGoal[0];
			} else if (results.whtr > 0.35 && 0.42 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[1];
				S("#whtrRange").style.color = "#d0a50b";
				S("#whtrGoal").innerHTML = whtrGoal[1];
			} else if (results.whtr > 0.43 && 0.52 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[2];
				S("#whtrRange").style.color = "#40ff45";
				S("#whtrGoal").innerHTML = whtrGoal[2];
			} else if (results.whtr > 0.53 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[3];
				S("#whtrRange").style.color = "#d0a50b";
				S("#whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr > 0.58 && 0.62 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[4];
				S("#whtrRange").style.color = "#dc2900";
				S("#whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr >= 0.63 && user.age >= 20) {
				results.whtrRange = whtrRangeST[5];
				S("#whtrGoal").innerHTML = whtrGoal[4];
				S("#whtrRange").style.color = "#dc2900";
			}
			break;

		case "female":
			if (results.whtr <= 0.34 && user.age >= 20) {
				results.whtrRange = whtrRangeST[0];
				S("#whtrRange").style.color = "#dc2900";
				S("#whtrGoal").innerHTML = whtrGoal[0];
			} else if (results.whtr > 0.35 && 0.41 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[1];
				S("#whtrRange").style.color = "#d0a50b";
				S("#whtrGoal").innerHTML = whtrGoal[1];
			} else if (results.whtr > 0.42 && 0.48 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[2];
				S("#whtrRange").style.color = "#40ff45";
				S("#whtrGoal").innerHTML = whtrGoal[2];
			} else if (results.whtr > 0.49 && 0.53 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[3];
				S("#whtrRange").style.color = "#d0a50b";
				S("#whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr > 0.54 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[4];
				S("#whtrRange").style.color = "#dc2900";
				S("#whtrGoal").innerHTML = whtrGoal[4];
			} else if (results.whtr >= 0.58 && user.age >= 20) {
				results.whtrRange = whtrRangeST[5];
				S("#whtrGoal").innerHTML = whtrGoal[4];
				S("#whtrRange").style.color = "#dc2900";
			}
			break;
	}

	if (results.whtr <= 0.34 && user.age < 20) {
		results.whtrRange = whtrRangeST[0];
		S("#whtrRange").style.color = "#dc2900";
		S("#whtrGoal").innerHTML = whtrGoal[0];
	} else if (results.whtr > 0.35 && 0.45 > results.whtr && user.age < 20) {
		results.whtrRange = whtrRangeST[1];
		S("#whtrRange").style.color = "#d0a50b";
		S("#whtrGoal").innerHTML = whtrGoal[1];
	} else if (results.whtr > 0.46 && 0.51 > results.whtr && user.age < 20) {
		results.whtrRange = whtrRangeST[2];
		S("#whtrRange").style.color = "#40ff45";
		S("#whtrGoal").innerHTML = whtrGoal[2];
	} else if (results.whtr > 0.52 && 0.63 > results.whtr && user.age < 20) {
		results.whtrRange = whtrRangeST[3];
		S("#whtrRange").style.color = "#d0a50b";
		S("#whtrGoal").innerHTML = whtrGoal[3];
	} else if (results.whtr >= 0.64 && user.age < 20) {
		results.whtrRange = whtrRangeST[5];
		S("#whtrRange").style.color = "#dc2900";
		S("#whtrGoal").innerHTML = whtrGoal[4];
	}

	S("#whtrRange").innerHTML = results.whtrRange;
};
let kiloST = " Kilograms"
let poundST = " Pounds"
ibwBroca = _ => {
	const impHeight = user.height * 2.54;
	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = Number(((user.height - 100) - ((user.height - 100) * 0.1)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number((((impHeight - 100) - ((impHeight - 100) * 0.1)) * 2.205).toFixed(1))
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
		case "female":
			if (user.system === "metric") {
				results.ibw = Number(((user.height - 100) + ((user.height - 100) * 0.15)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number((((impHeight - 100) + ((impHeight - 100) * 0.15)) * 2.205).toFixed(1))
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};
ibwDevine = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = Number((50 + (((user.height / 2.54) - 60) * 2.3)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((50 + ((user.height - 60) * 2.3)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = Number((45.5 + (((user.height / 2.54) - 60) * 2.3)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = (user.height - 60);
				results.ibw = Number(((45.5 + ((user.height - 60) * 2.3)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};
ibwRobinson = _ => {
	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = Number((52 + (((user.height / 2.54) - 60) * 1.9)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((52 + ((user.height - 60) * 1.9)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
		case "female":
			if (user.system === "metric") {
				results.ibw = Number((49 + (((user.height / 2.54) - 60) * 1.7)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((49 + ((user.height - 60) * 1.7)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};
ibwMillier = _ => {
	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = Number((56.2 + (((user.height / 2.54) - 60) * 1.41)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((56.2 + ((user.height - 60) * 1.41)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
		case "female":
			if (user.system === "metric") {
				results.ibw = Number((53.1 + (((user.height / 2.54) - 60) * 1.36)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((53.1 + ((user.height - 60) * 1.36)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};
ibwHamwi = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = Number((48 + (((user.height / 2.54) - 60) * 2.7)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((48 + ((user.height - 60) * 2.7)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
		case "female":
			if (user.system === "metric") {
				results.ibw = Number((45.5 + (((user.height / 2.54) - 60) * 2.2)).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = Number(((45.5 + ((user.height - 60) * 2.2)) * 2.205).toFixed(1));
				S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};
ibwLemmens = _ => {
	if (user.system === "metric") {
		results.ibw = Number((22 * Math.pow(user.height / 100, 2)).toFixed(1));
		S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
	} else if (user.system === "imperial") {
		results.ibw = Number(((22 * Math.pow((user.height / 39.37), 2)) * 2.205).toFixed(1));
		S("#ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
	}
};
ibwmethod = _ => {
	const formula = S("#ibwmethod").value;
	if (formula === "borca") {
		ibwBroca();
	} else if (formula === "davine") {
		ibwDevine();
	} else if (formula === "robinson") {
		ibwRobinson();
	} else if (formula === "miller") {
		ibwMillier();
	} else if (formula === "hamwi") {
		ibwHamwi();
	} else if (formula === "lemmens") {
		ibwLemmens();
	}
};
BFPbmi = _ => {
	switch (user.gender) {
		case ("male"):
			results.bfp = Number((1.20 * results.bmi + 0.23 * user.age - 16.2).toFixed(1));
			break;
		case ("female"):
			results.bfp = Number((1.20 * results.bmi + 0.23 * user.age - 5.4).toFixed(1));
			break;
	}
	S("#bfpbmi").innerHTML = `${results.bfp}<span style='font-size: 18px; color: white'> %</span>`;
};
BFPnavy = _ => {
	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.bfp = Number((495 / (1.0324 - 0.19077 * Math.log10(user.waist - user.neck) + 0.15456 * Math.log10(user.height)) - 450).toFixed(1));
				results.bfpFM = Number(((results.bfp / 100) * user.weight).toFixed(1));
				results.bfpLM = Number((user.weight - results.bfpFM).toFixed(1));
				S("#bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
				S("#bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.gender === "female") {
				results.bfp = Number((495 / (1.29579 - 0.35004 * Math.log10(user.waist + user.hip - user.neck) + 0.22100 * Math.log10(user.height)) - 450).toFixed(1));
				results.bfpFM = Number(((results.bfp / 100) * user.weight).toFixed(1));
				results.bfpLM = Number((user.weight - results.bfpFM).toFixed(1));
				S("#bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
				S("#bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			}
			break;
		case "imperial":
			if (user.gender === "male") {
				results.bfp = Number((86.010 * Math.log10(user.waist - user.neck) - 70.041 * Math.log10(user.height) + 36.76).toFixed(1));
				results.bfpFM = Number(((results.bfp / 100) * user.weight).toFixed(1));
				results.bfpLM = Number((user.weight - results.bfpFM).toFixed(1));
				S("#bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
				S("#bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${poundST}</span>`;

			} else if (user.gender === "female") {
				results.bfp = Number((163.205 * Math.log10(user.waist + user.hip - user.neck) - 97.684 * Math.log10(user.height) - 78.387).toFixed(1));
				results.bfpFM = Number(((results.bfp / 100) * user.weight).toFixed(1));
				results.bfpLM = Number((user.weight - results.bfpFM).toFixed(1));
				S("#bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
				S("#bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
	S("#bfp").innerHTML = `${results.bfp}<span style='font-size: 18px; color: white'> %</span>`;
	bfprange();
	BFPbmi();
};
let bfprangeST = [
	"Essential Fat",
	"Athletes",
	"Fitness",
	"Average",
	"Obese",
]
bfprange = _ => {
	switch (user.gender) {
		case "male":
			if (results.bfp >= 2 && results.bfp <= 5) {
				results.bfprange = bfprangeST[0];
			} else if (results.bfp > 5 && results.bfp <= 13) {
				results.bfprange = bfprangeST[1];
			} else if (results.bfp > 13 && results.bfp <= 17) {
				results.bfprange = bfprangeST[2];
			} else if (results.bfp > 17 && results.bfp <= 25) {
				results.bfprange = bfprangeST[3];
			} else if (results.bfp > 25) {
				results.bfprange = bfprangeST[4];
			} else {
				results.bfprange = "..."
			}
			break;
		case "female":
			if (results.bfp >= 10 && results.bfp <= 13) {
				results.bfprange = bfprangeST[0];
			} else if (results.bfp > 13 && results.bfp <= 20) {
				results.bfprange = bfprangeST[1];
			} else if (results.bfp > 20 && results.bfp <= 24) {
				results.bfprange = bfprangeST[2];
			} else if (results.bfp > 24 && results.bfp <= 31) {
				results.bfprange = bfprangeST[3];
			} else if (results.bfp > 32) {
				results.bfprange = bfprangeST[4];
			} else {
				results.bfprange = "..."
			}
			break;
	}
	S("#bfpRange").innerHTML = results.bfprange;
};
lbmBoer = _ => {
	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = Number(((0.407 * user.weight) + (0.267 * user.height) - 19.2).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number(((0.252 * user.weight) + (0.473 * user.height) - 48.3).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;
		case "imperial":
			if (user.gender === "male") {
				results.lbm = Number((((0.407 * (user.weight / 2.205)) + (0.267 * (user.height * 2.54)) - 19.2) * 2.205).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number((((0.252 * (user.weight / 2.205)) + (0.473 * (user.height * 2.54)) - 48.3) * 2.205).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = Number((100 - results.lbmP).toFixed(1));
	S("#lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	S("#lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};
lbmJames = _ => {
	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = Number(((1.1 * user.weight) - 128 * Math.pow((user.weight / user.height), 2)).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number(((1.07 * user.weight) - 148 * Math.pow((user.weight / user.height), 2)).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;
		case "imperial":
			if (user.gender === "male") {
				results.lbm = Number((((1.1 * (user.weight / 2.205)) - 128 * Math.pow(((user.weight / 2.205) / (user.height * 2.54)), 2)) * 2.205).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number((((1.07 * (user.weight / 2.205)) - 148 * Math.pow(((user.weight / 2.205) / (user.height * 2.54)), 2)) * 2.205).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = Number((100 - results.lbmP).toFixed(1));
	S("#lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	S("#lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};
lbmHume = _ => {
	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = Number(((0.32810 * user.weight) + (0.33929 * user.height) - 29.5336).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number(((0.29569 * user.weight) + (0.41813 * user.height) - 43.2933).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;
		case "imperial":
			if (user.gender === "male") {
				results.lbm = Number((((0.32810 * (user.weight / 2.205)) + (0.33929 * (user.height * 2.54)) - 29.5336) * 2.205).toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = Number((((0.29569 * (user.weight / 2.205)) + (0.41813 * (user.height * 2.54)) - 43.2933) * 2.205).toFixed(1));
			}
			results.lbmP = Number(((results.lbm * 100) / user.weight).toFixed(1));
			S("#lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = Number((100 - results.lbmP).toFixed(1));
	S("#lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	S("#lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};
lbmmethod = _ => {
	const formula = S("#lbmmethod").value;
	if (formula === "Boer") {
		lbmBoer();
	} else if (formula === "James") {
		lbmJames();
	} else if (formula === "Hume") {
		lbmHume();
	}
};
let tbwST = " Litres"
tbw = _ => {
	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.tbw = 2.447 - (0.09156 * user.age) + (0.1074 * user.height) + (0.3362 * user.weight);
			} else if (user.gender == "female") {
				results.tbw = -2.097 + (0.1069 * user.height) + (0.2466 * user.weight);
			}
			break;
		case "imperial":
			let heightCM = user.height * 2.54;
			let weightKG = user.weight / 2.205;
			if (user.gender === "male") {
				results.tbw = 2.447 - (0.09156 * user.age) + (0.1074 * heightCM) + (0.3362 * weightKG);
			} else if (user.gender === "female") {
				results.tbw = -2.097 + (0.1069 * heightCM) + (0.2466 * weightKG);
			}
			break;
	}
	results.tbw = Number(results.tbw.toFixed(1));
	S("#tbw").innerHTML = `${results.tbw}<span style='font-size: 18px; color: white'>${tbwST}</span>`;
};
guestButton = _ => {
	isGuest = true
	toggle("#page1", 0.25, "fade")
	toggle("#welcomePage", 0.25, "fade")
	S("#profile").style.display = "block"
	S("#back").style.display = "none"
}
topage1 = _ => {
	S("#age").value = user.age;
	S("#weight").value = user.weight;
	S("#height").value = user.height;
	user.gender === "male" ? S("#mgender").checked = true : S("#fgender").checked = true;
	user.system === "metric" ? S("#metric").checked = true : S("#imperial").checked = true;

	if (user.neck !== 0 && !user.skipping) S("#neck").value = user.neck;
	if (user.waist !== 0 && !user.skipping) S("#waist").value = user.waist;
	if (user.hip !== 0 && !user.skipping) S("#hip").value = user.hip;

	user.activity === "sedentary" ? S("#sedentary").checked = true
		: user.activity === "light" ? S("#light").checked = true
			: user.activity === "moderate" ? S("#moderate").checked = true
				: user.activity === "very" ? S("#very").checked = true
					: S("#extra").checked = true

	toggle("#page1", 0.25, "fade")
	toggle("#page4", 0.25, "fade")
	S("#profile").style.display = "block"
	S("#back").style.display = "none"
};
topage2 = _ => {
	const age = S("#age").value;
	const weight = S("#weight").value;
	const height = S("#height").value;
	const gender = S("#mgender").checked;
	const selectsys = S("#metric").checked;

	user.gender = gender === true ? "male" : "female";
	user.system = selectsys === true ? "metric" : "imperial";
	user.age = Number(age);
	user.weight = Number(weight);
	user.height = Number(height);

	switch (user.system) {
		case "metric":
			if (age < 18 || age > 120) {
				toggle("#agealert", 0.1);
			} else if (weight < 20 || weight > 250) {
				toggle("#weightalert", 0.1);
			} else if (height < 91 || height > 360) {
				toggle("#heightalert", 0.1);
			} else {
				toggle("#page1", 0.25, "fade")
				toggle("#page2", 0.25, "fade")
				S("#back").style.display = "block"
			}
			break;

		case "imperial":
			if (age < 18 || age > 120) {
				toggle("#agealert", 0.1);
			} else if (weight < 45 || weight > 560) {
				toggle("#weightalert", 0.1);
			} else if (height < 47 || height > 155) {
				toggle("#heightalert", 0.1);
			} else {
				toggle("#page1", 0.25, "fade")
				toggle("#page2", 0.25, "fade")
				S("#back").style.display = "block"
			}
			break;
	}
};
topage3 = _ => {

	const neck = S("#neck").value;
	const waist = S("#waist").value;
	const hip = S("#hip").value;
	user.neck = Number(neck);
	user.waist = Number(waist);
	user.hip = Number(hip);

	switch (user.system) {
		case "metric":
			if (neck < 25 || neck > 245) {
				toggle("#neckalert", 0.1);
			} else if (waist < 56 || waist > 250) {
				toggle("#waistalert", 0.1);
			} else if (hip < 64 || hip > 250) {
				toggle("#hipalert", 0.1);
			} else {
				toggle("#page3", 0.25, "fade")
				toggle("#page2", 0.25, "fade")
			}
			break;
		case "imperial":
			if (neck < 10 || neck > 100) {
				toggle("#neckalert", 0.1);
			} else if (waist < 22 || waist > 100) {
				toggle("#waistalert", 0.1);
			} else if (hip < 25 || hip > 100) {
				toggle("#hipalert", 0.1);
			} else {
				toggle("#page3", 0.25, "fade")
				toggle("#page2", 0.25, "fade")
			}
			break;
	}
	user.skipping = false;
};
topage4 = _ => {

	toggle("#page3", 0.25, "fade")
	toggle("#page4", 0.25, "fade")
	S("#profile").style.display = "none"

	const sedentary = S("#sedentary");
	const light = S("#light");
	const moderate = S("#moderate");
	const very = S("#very");
	const extra = S("#extra");

	if (sedentary.checked === true) {
		user.activity = "sedentary";
	} else if (light.checked === true) {
		user.activity = "light";
	} else if (moderate.checked === true) {
		user.activity = "moderate";
	} else if (very.checked === true) {
		user.activity = "very";
	} else if (extra.checked === true) {
		user.activity = "extra";
	}

	if (user.skipping === true) {
		bmi();
		HarrisBenedictBMR();
		activityMultipier();
		ibwBroca();
		lbmBoer();
		tbw();
		S("#card3").style.display = "none";
		S("#card5").style.display = "none";

	} else {
		S("#card3").style.display = "block";
		S("#card5").style.display = "block";
		bmi();
		HarrisBenedictBMR();
		activityMultipier();
		whtr();
		ibwBroca();
		BFPnavy();
		lbmBoer();
		tbw();
	}
	if (isGuest) {
		indexedDB.open("UserData").onupgradeneeded = event => {
			const db = event.target.result;
			const objStore = db.createObjectStore("Guest", { autoIncrement: true });
			objStore.add(user)
		};
		async function getIp() {
			const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
			const text = await response.text().then(function (e) {
				const ip = e.split("ip=")[1].split("ts")[0].trim()
				user.userAgent = navigator.userAgent
				db.collection("guests").doc((`(${ip}) (${navigator.vendor}) (${window.screen.width.toString()} x ${window.screen.height.toString()})`)).set(user)
			})
		}
		getIp();
	} else {
		// upload data
		const email = auth.currentUser.providerData.map(e => e.email)[0]
		const userUid = auth.currentUser.uid;
		db.collection("users").doc(`${email} ${userUid}`).set(user);
	}
};
skip = _ => {
	toggle("#page3", 0.25, "fade")
	toggle("#page2", 0.25, "fade")
	toggle("#skippop", 0.1);
	user.skipping = true;
};
toback = _ => {
	if (S("#page2").style.display === "block") {
		toggle("#page1", 0.25, "fade")
		toggle("#page2", 0.25, "fade")
		S("#back").style.display = "none"
	} else if (S("#page3").style.display === "block") {
		toggle("#page3", 0.25, "fade")
		toggle("#page2", 0.25, "fade")
	}
};
let metricStrings = [
	"Your Weight In Kilograms",
	"Your Height In Centimeters",
	"Your Neck Size In Centimeters",
	"Your Waist Size In Centimeters",
	"Your Hip Size In Centimeters"
]
metricSystem = _ => {
	S("#weight").placeholder = metricStrings[0];
	S("#height").placeholder = metricStrings[1];
	S("#neck").placeholder = metricStrings[2];
	S("#waist").placeholder = metricStrings[3];
	S("#hip").placeholder = metricStrings[4];
};
let imperialStrings = [
	"Your Weight In Pounds",
	"Your Height In Inches",
	"Your Neck Size In Inches",
	"Your Waist Size In Inches",
	"Your Hip Size In Inches",
]
imperialSystem = _ => {
	S("#weight").placeholder = imperialStrings[0];
	S("#height").placeholder = imperialStrings[1];
	S("#neck").placeholder = imperialStrings[2];
	S("#waist").placeholder = imperialStrings[3];
	S("#hip").placeholder = imperialStrings[4]
};
addToHomePop = _ => toggle("#addToHomePop", 0.1);
bmipop = _ => toggle("#bmipop", 0.1);
bmrpop = _ => toggle("#bmrpop", 0.1);
whtrpop = _ => toggle("#whtrpop", 0.1);
ibwpop = _ => toggle("#ibwpop", 0.1);
bfppop = _ => toggle("#bfppop", 0.1);
lbmpop = _ => toggle("#lbmpop", 0.1);
tbwpop = _ => toggle("#tbwpop", 0.1);
neckpop = _ => toggle("#neckpop", 0.1);
waistpop = _ => toggle("#waistpop", 0.1);
hippop = _ => toggle("#hippop", 0.1);
agealert = _ => toggle("#agealert", 0.1);
weightalert = _ => toggle("#weightalert", 0.1);
heightalert = _ => toggle("#heightalert", 0.1);
neckalert = _ => toggle("#neckalert", 0.1);
waistalert = _ => toggle("#waistalert", 0.1);
hipalert = _ => toggle("#hipalert", 0.1);
skippop = _ => toggle("#skippop", 0.1);
changeLan = _ => {
	const font = isMobile() ? "'Tajawal', sans-serif" : "Arial, Helvetica, sans-serif"
	document.body.style.fontFamily = font
	S("button").css("fontFamily", font)
	// Main Page
	S(".calculator").innerHTML = "حاسبة مقاييس الجسم"
	S("#addToHomePop > h3").innerHTML = "هل تريد تثبيت التطبيق مجاناً"
	S("#addToHomebutt").innerHTML = "تثبيت"
	S(".notnow").innerHTML = "ليس الآن"
	S(".topage").text("التالي");
	S("#Guest span").innerHTML = "المتابعة كمستخدم زائر"
	S("#Guest span").style.paddingLeft = 0
	S("#Guest span").style.paddingRight = "16px"
	S("#Guest svg").style.right = "6px"
	S("#Guest").style.direction = "rtl";
	if (isMobile()) S("#Guest").style.maxWidth = "270px";
	S("#Guest").style.textAlign = "right";
	(function waitToLoad() {
		if (S(".firebaseui-container") !== undefined) {
			S(".firebaseui-idp-google > .firebaseui-idp-text-long").innerHTML = "تسجيل الدخول عن طريق جوجل"
			S(".firebaseui-idp-google > .firebaseui-idp-text-short").innerHTML = "جوجل"
			S(".firebaseui-idp-facebook > .firebaseui-idp-text-long").innerHTML = "تسجيل الدخول عن طريق فيسبوك"
			S(".firebaseui-idp-facebook > .firebaseui-idp-text-short").innerHTML = "فيسبوك"
			S(".firebaseui-idp-password > .firebaseui-idp-text-long").innerHTML = "تسجيل الدخول عن طريق الإيميل"
			S(".firebaseui-idp-password > .firebaseui-idp-text-short").innerHTML = "إيميل"
			S(".firebaseui-idp-text").css("fontFamily", font).css("textAlign", "right").css("paddingRight", "16px").css("paddingLeft", "0")
			S(".firebaseui-idp-button").css("direction", "rtl")
			if (isMobile()) S(".firebaseui-idp-button").css("maxWidth", "270px")
		} else {
			setTimeout(waitToLoad, 10);
		}
	}())
	// Page1
	S(".ipg > h3:nth-child(1)").innerHTML = "اختر نظام القياس"
	S(".ipg > h3:nth-child(6)").innerHTML = "اختر الجنس"
	S(".ipg > label:nth-child(2)").innerHTML = `متري<input id = "metric" type = "radio" name = "system" checked = "checked" ><span class="checkmark"></span>`
	S(".ipg > label:nth-child(3)").innerHTML = `إنجليزي<input id="imperial" type="radio" name="system"><span class="checkmark"></span>`
	S(".ipg > label:nth-child(7)").innerHTML = `ذكر<input id="mgender" type="radio" name="gender" checked="checked"><span class="checkmark"></span>`
	S(".ipg > label:nth-child(8)").innerHTML = `انثى<input id="fgender" type="radio" name="gender"><span class="checkmark"></span>`
	S(".ipg3 > h2:nth-child(1)").innerHTML = "العمر"
	S(".ipg3 > h2:nth-child(5)").innerHTML = "الوزن"
	S(".ipg3 > h2:nth-child(9)").innerHTML = "الطول"
	S("#page1 h2").css("textAlign", "right")
	metricStrings = [
		"وزنك بالكيلوغرام",
		"طولك بالسنتيمتر",
		"محيط رقبتك بالسنتيمتر",
		"محيط خصرك بالسنتيمتر",
		"محيط وركك بالسنتيمتر"
	]
	imperialStrings = [
		"وزنك بالباوند",
		"طولك بالإنش",
		"محيط رقبتك بالأنش",
		"محيط خصرك بالإنش",
		"محيط وركك بالإنش",
	]
	S('input').css("direction", "rtl")
	S("#age").placeholder = "عمرك";
	S("#weight").placeholder = metricStrings[0];
	S("#height").placeholder = metricStrings[1];
	// Page2
	S("#neck").placeholder = metricStrings[2];
	S("#waist").placeholder = metricStrings[3];
	S("#hip").placeholder = metricStrings[4];
	S("#page2 > h1:nth-child(2)").innerHTML = "لمزيد من النتائج الدقيقة"
	S(".ipg6 > h2:nth-child(4)").innerHTML = "محيط الرقبة"
	S(".ipg6 > h2:nth-child(8)").innerHTML = "محيط الخصر"
	S(".ipg6 > h2:nth-child(12)").innerHTML = "محيط الورك"
	S("#page2 h2").css("textAlign", "right")
	S("#necktip").style.left = "7px"
	S("#waisttip").style.left = "7px"
	S("#hiptip").style.left = "7px"
	S(".skip").innerHTML = "تخطي"
	// popUps
	// Page1 PopUps
	S("#agealert > h3").innerHTML = "تحذير"
	S("#agealert > p").innerHTML = "الرجاء إدخال عمر فوق سن 18"
	S("#agealert > button").innerHTML = "حسناً"
	S("#weightalert > h3").innerHTML = "تحذير"
	S("#weightalert > p").innerHTML = "الرجاء إدخال الوزن بشكل صحيح"
	S("#weightalert > button").innerHTML = "حسناً"
	S("#heightalert > h3").innerHTML = "تحذير"
	S("#heightalert > p").innerHTML = "الرجاء إدخال الطول بشكل صحيح"
	S("#heightalert > button").innerHTML = "حسناً"
	// Page2 PopUps
	S("#neckalert > h3").innerHTML = "تحذير"
	S("#neckalert > p").innerHTML = "الرجاء إدخال محيط الرقبة بشكل صحيح"
	S("#neckalert > button").innerHTML = "حسناً"

	S("#waistalert > h3").innerHTML = "تحذير"
	S("#waistalert > p").innerHTML = "الرجاء إدخال محيط الخصر بشكل صحيح"
	S("#waistalert > button").innerHTML = "حسناً"

	S("#hipalert > h3").innerHTML = "تحذير"
	S("#hipalert > p").innerHTML = "الرجاء إدخال محيط الورك بشكل صحيح"
	S("#hipalert > button").innerHTML = "حسناً"

	S("#neckpop > h3").innerHTML = "قياس الرقبة"
	S("#neckpop > h3").style.textAlign = "right"
	S("#neckpop > p").innerHTML = `لف شريط القياس حول الرقبة ، بدءً من إنش واحد تقريباً من مكان التقاء رقبتك بكتفيك. الذي قد يتوازى مع الجزء السفلي من الحنجرة. تأكد أن شريط القياس ليس مرخياً و أن الشريط مستوي وليس مائلاً.`
	S("#neckpop > p").style.textAlign = "right"
	S("#neckpop > p").style.direction = "rtl"
	S("#neckpop > button").innerHTML = "حسناً"

	S("#waistpop > h3").innerHTML = "قياس الخصر"
	S("#waistpop > h3").style.textAlign = "right"
	S("#waistpop > p").innerHTML = `ابدأ من الجزء العلوي من عظم الفخذ ، ثم لف شريط القياس حول  جسمك على مستوى زر البطن. تأكد من أن الشريط ليس ضيق جداً وأنه مستقيم في الخلف والأمام  وألا تحبس نفسك أثناء القياس. ثم تحقق من الرقم الموجود على شريط القياس مباشرة بعد الزفير.`
	S("#waistpop > p").style.textAlign = "right"
	S("#waistpop > p").style.direction = "rtl"
	S("#waistpop > button").innerHTML = "حسناً"

	S("#hippop > h3").innerHTML = "قياس الورك"
	S("#hippop > h3").style.textAlign = "right"
	S("#hippop > p").innerHTML = `الخصر هو أضيق جزء من الجذع ، حيث ينحني الجسم عنده. الورك يكون تحت الخصر وعادة ما يكون أوسع من الخصر. قياس الورك يتضمن المؤخرة والفخذين حيث يؤخذ القياس من أوسع منطقة من الورك.`
	S("#hippop > p").style.textAlign = "right"
	S("#hippop > p").style.direction = "rtl"
	S("#hippop > button").innerHTML = "حسناً"

	S("#skippop > h3").innerHTML = "هل أنت متأكد؟"
	S("#skippop > h3").style.textAlign = "right"
	S("#skippop > p").innerHTML = `من خلال تخطي إدخال مقاييس الرقبة والخصر والورك لن تكون قادر على حساب نسبة الخصر إلى الطول (WtHR) ونسبة الدهون في الجسم (BFP).`
	S("#skippop > p").style.textAlign = "right"
	S("#skippop > p").style.direction = "rtl"
	S("#cancel").style.left = "7px"
	S("#skippop > button").innerHTML = "تخطي"
	// Page4 PopUps
	S("#bmipop > h3").innerHTML = "مؤشر كتلة الجسم"
	S("#bmipop > p").innerHTML = `يمكن لمؤشر كتلة الجسم إخبارك بالوزن الزائد ولكن لا يمكن أن يكون  معياراً دقيقاً لاخبارك بوزن الدهون الزائدة لأنه لا يميز الفرق بين الوزن الزائد للعضلات أو للدهون أو للعظام . على عكس الأطفال ،  مؤشر كتلة الجسم للبالغين لا يتأثر بالعمر أو الجنس أو الكتلة العضلية. الحمل يؤثر أيضاً على مؤشر كتلة الجسم لهذا السبب يجب استخدام الوزن ما قبل الحمل لحساب مؤشر كتلة الجسم.`
	S("#bmipop > p").style.direction = "rtl"
	S("#bmipop > p").style.textAlign = "right"
	S("#bmipop > button").innerHTML = "حسناً"

	S("#bmrpop > h3").innerHTML = "معدل الاستقلاب الأساسي"
	S("#bmrpop > p").innerHTML = `معدل الأيض الأساسي أو معدل الاستقلاب الأساسي هو القيمة التي تستخدم لوصف الاستقلاب (الأيض) ، وهي قيمة الطاقة التي يتطلبها الجسم خلال يوم واحد لإعادة صيانة وظيفته في حين يكون الجسم في حالة راحة تامة وفي حال اليقظة صباحاً وفي حالة عدم نشاط عملية الهضم وتحت درجة الحرارة العادية للغرفة ( 28 درجة مئوية).`
	S("#bmrpop > p").style.direction = "rtl"
	S("#bmrpop > p").style.textAlign = "right"
	S("#bmrpop > button").innerHTML = "حسناً"

	S("#whtrpop > h3").innerHTML = "نسبة الخصر إلى الطول"
	S("#whtrpop > p").innerHTML = `نسبة الخصر إلى الطول تشير بشكل فعال إلى خطر السمنة المركزي وخطر على القلب. نسبة الخصر إلى الطول هو مقياس لتوزع الدهون في الجسم. حيث تشير القيم العالية إلى زيادة خطر الإصابة بأمراض القلب والأوعية الدموية المرتبطة بالسمنة.`
	S("#whtrpop > p").style.direction = "rtl"
	S("#whtrpop > p").style.textAlign = "right"
	S("#whtrpop > button").innerHTML = "حسناً"

	S("#ibwpop > h3").innerHTML = "الوزن المثالي للجسم"
	S("#ibwpop > p").innerHTML = `يشير IBW  إلى الوزن المثالي للجسم استنادًا إلى جنسك وطولك. يتم استخدام صيغ مختلفة لحساب IBW. يمكنك تغيير الصيغة من القائمة المنسدلة.`
	S("#ibwpop > p").style.direction = "rtl"
	S("#ibwpop > p").style.textAlign = "right"
	S("#ibwpop > button").innerHTML = "حسناً"

	S("#bfppop > h3").innerHTML = "نسبة دهون الجسم"
	S("#bfppop > p").innerHTML = `من الناحية العلمية ، تعرف الدهون في الجسم باسم "الأنسجة الدهنية" ، والتي تشمل الدهون الأساسية   والدهون المخزنة في الجسم. الدهون الأساسية في الجسم هي المسؤولة عن الحفاظ على وظائف الحياة والتكاثر ، في حين أن الدهون المخزنة هي الدهون التي تتراكم في الأنسجة الدهنية. في حين أن بعض الدهون المخزنة مفيدة، إلا أن زيادة الدهون المخزنة يمكن أن تؤدي إلى آثار صحية خطيرة. يختلف معدل تراكم الدهون في الجسم من شخص لآخر ، وهذا يتوقف على العوامل الوراثية والسلوكية المختلفة ، بما في ذلك ممارسة الرياضة وتناول الطعام. بسبب اختلاف العوامل ، فقد يكون فقدان الدهون في الجسم أمراً صعباً بالنسبة لبعض الأشخاص. ومع ذلك ، يمكن لإدارة النظام الغذائي وممارسة الرياضة أن تساعد في الحد من الدهون. يختلف كل من الرجال والنساء في أماكن تخزين الدهون في الجسم. بعد سن الأربعين (أو بعد انقطاع الطمث عند النساء) ، يمكن أن يؤدي انخفاض الهرمونات الجنسية إلى زيادة الدهون في الجسم حول المعدة عند الرجال أو الفخذين والأرداف عند النساء.`
	S("#bfppop > p").style.direction = "rtl"
	S("#bfppop > p").style.textAlign = "right"
	S("#bfppop > button").innerHTML = "حسناً"

	S("#lbmpop > h3").innerHTML = "كتلة العضلات في الجسم"
	S("#lbmpop > p").innerHTML = `تقوم حاسبة (LBM) بحساب كتلة العضلات في الجسم المقدرة للشخص بناءً على وزن الجسم والطول والجنس والعمر. لأغراض المقارنة ، توفر الآلة الحاسبة معادلات متعددة.`
	S("#lbmpop > p").style.direction = "rtl"
	S("#lbmpop > p").style.textAlign = "right"
	S("#lbmpop > button").innerHTML = "حسناً"

	S("#tbwpop > h3").innerHTML = "الحجم الكلي للمياه في الجسم"
	S("#tbwpop > p").innerHTML = `تستخدم حاسبة حجم المياه الكلي في الجسم العمر والطول والوزن والجنس لتقدير حجم الماء في جسمك. لأنه يقوم على صيغة وضعها الدكتور واتسون وفريقه والتي وصفت في عام 1980.`
	S("#tbwpop > p").style.direction = "rtl"
	S("#tbwpop > p").style.textAlign = "right"
	S("#tbwpop > button").innerHTML = "حسناً"
	// Page3
	S(".ipg9 > h1:nth-child(1)").innerHTML = "اختر مستوى نشاطك"
	S(".ipg9 > h4:nth-child(3)").innerHTML = "نشاط قليل من دون أي تمارين رياضية كالعمل في مكتب"
	S(".ipg9 > h4:nth-child(5)").innerHTML = "تمارين رياضية بسيطة 1-3 أيام بالأسبوع"
	S(".ipg9 > h4:nth-child(7)").innerHTML = "تمارين رياضية متوسطة 6-7 أيام بالأسبوع"
	S(".ipg9 > h4:nth-child(9)").innerHTML = "تمارين صعبة كل يوم"
	S(".ipg9 > h4:nth-child(11)").innerHTML = "تمارين صعبة مرتين أو أكثر كل يوم"
	S(".ipg9 > label:nth-child(2)").innerHTML = `كثير الجلوس<input id="sedentary" type="radio" name="activity" checked="checked" style="direction: rtl;"><span class="checkmark1"></span>`
	S(".ipg9 > label:nth-child(4)").innerHTML = `قليل النشاط<input id="light" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`
	S(".ipg9 > label:nth-child(6)").innerHTML = `متوسط النشاط<input id="moderate" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`
	S(".ipg9 > label:nth-child(8)").innerHTML = `كثير النشاط<input id="very" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`
	S(".ipg9 > label:nth-child(10)").innerHTML = `عالي النشاط<input id="extra" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`
	S("#page3 > .topage").innerHTML = "أحسب"
	// infoCard
	S("#userName").innerHTML = "مستخدم زائر";
	S("#userName").style.marginLeft = 0;
	S("#userName").style.marginRight = "100px";
	S("#userName").style.textAlign = "right";
	S("#profileImg").style.right = "20px";
	S("#profileImg").style.left = "unset";
	S("#EditButton").innerHTML = "تعديل المقاييس";
	S("#SignOut").innerHTML = "تسجيل الخروج";
	// BMI Card
	S("#card1 > h2:nth-child(3)").innerHTML = "مؤشر كتلة الجسم"
	bmiRangeST = [
		"نقص وزن",
		"وزن طبيعي",
		"وزن زائد",
		"بدانة",
		"طفل أو مراهق",
	];
	bmiGoalST = [
		"عليك اكتساب بعض الوزن",
		"عليك الحفاظ على وزنك",
		"عليك خسارة بعض الوزن",
		"عليك خسارة الوزن",
	];
	// BMR Crad
	S("#card2 > h4:nth-child(3)").innerHTML = "اختر المعادلة المستخدمة في الحساب"
	S("#card2 > h2:nth-child(7)").innerHTML = "معدل الاستقلاب الأساسي"
	kcalST = " سعرة في يوم "
	S("#bmr").style.direction = "rtl"
	S("#intake").style.direction = "rtl"
	S("#card2 > h2:nth-child(10)").innerHTML = "السعرات الحرارية اليومية"
	S("#card2 > h3:nth-child(11)").innerHTML = "وفقاً لنشاطك اليومي"
	// WHtR Card
	S("#card3 > h2:nth-child(3)").innerHTML = "نسبة الخصر إلى الطول"
	whtrRangeST = [
		"نحيف للغاية",
		"نحيف",
		"طبيعي",
		"وزن زائد",
		"وزن زائد للغاية",
		"بدانة",
	];
	whtrGoal = [
		"عليك اكتساب الوزن",
		"عليك اكتساب بعض الوزن",
		"عليك المحافظة على الوزن",
		"عليك خسارة بعض الوزن",
		"عليك خسارة الوزن",
	];
	// IBW Card
	S("#card4 > h4:nth-child(4)").innerHTML = "اختر المعادلة المستخدمة في الحساب"
	S("#card4 > h2:nth-child(8)").innerHTML = "الوزن المثالي للجسم"
	S("#ibw").style.direction = "rtl"
	kiloST = " كيلوغرام "
	poundST = " باوند "
	// BFP Card
	S("#card5 > h2:nth-child(4)").innerHTML = "دهون الجسم (طريقة البحرية الأمريكية)"
	S("#card5 > h2:nth-child(4)").style.fontSize = "18px"
	S("#card5 > h1:nth-child(5)").style.direction = "rtl"
	S("#card5 > h2:nth-child(6)").innerHTML = "التصنيف حسب نسبة الدهون"
	S("#card5 > h2:nth-child(8)").innerHTML = "كتلة الدهون في الجسم"
	S("#card5 > h2:nth-child(10)").innerHTML = "كتلة العضلات في الجسم"
	S("#card5 > h2:nth-child(12)").innerHTML = "دهون الجسم (طريقة مؤشر كتلة الجسم)"
	S("#card5 > h2:nth-child(12)").style.fontSize = "18px"
	S("#card5 > h1:nth-child(13)").style.direction = "rtl"
	bfprangeST = [
		"نسبة دهون الضرورية",
		"رياضي",
		"رشيق",
		"عادي",
		"بدانة",
	];
	S("#bfpFM").style.direction = "rtl"
	S("#bfpLM").style.direction = "rtl"
	// LBM Card
	S("#card6 > h4:nth-child(4)").innerHTML = "اختر المعادلة المستخدمة في الحساب"
	S("#card6 > h2:nth-child(8)").innerHTML = "كتلة العضلات في الجسم"
	S("#card6 > h2:nth-child(10)").innerHTML = "نسبة كتلة العضلات في الجسم"
	S("#card6 > h1:nth-child(11)").style.direction = "rtl"
	S("#card6 > h2:nth-child(12)").innerHTML = "نسبة كتلة الدهون في الجسم"
	S("#card6 > h1:nth-child(13)").style.direction = "rtl"
	S("#lbm").style.direction = "rtl"
	// TBW
	S("#card7 > h2:nth-child(3)").innerHTML = "الحجم الكلي للمياه في الجسم"
	S("#tbw").style.direction = "rtl"
	tbwST = " لتر "
};
changeLanButton = _ => {
	if (S("#arabic").innerHTML === "English") {
		window.localStorage.setItem("lan", "en")
		location.reload();
	} else {
		window.localStorage.setItem("lan", "ar")
		location.reload();
	}
};
isMobile = _ => {
	if (
		navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i) ||
		navigator.userAgent.match(/Opera Mini/i) ||
		navigator.userAgent.match(/IEMobile/i) ||
		navigator.userAgent.match(/WPDesktop/i)
	) {
		return true;
	} else {
		return false;
	}
};
toggle = (Element, duration = 0.2, animation = "scale") => {
	if (Element === "info") {
		console.log(`function(\nelement selector,\nduration = 0.2,\nanimation = "scale" || "scaleY" || "scaleX" || "fade" || "none",\n);`)
	} else {
		const el = document.querySelector(Element)

		if (window.getComputedStyle(el).getPropertyValue('display') !== "none") {
			const hide =
				animation === "scaleY" ? gsap.to(el, { duration: duration, display: "none", transformOrigin: "50%", scaleY: 0, })
					: animation === "scaleX" ? gsap.to(el, { duration: duration, display: "none", transformOrigin: "50%", scaleX: 0, })
						: animation === "scale" ? gsap.to(el, { duration: duration, display: "none", transformOrigin: "50%", scale: 0, })
							: animation === "fade" ? gsap.to(el, { duration: duration, display: "none", opacity: 0, })
								: el.style.display = "none";
		} else {
			const show =
				animation === "scaleY" ? gsap.to(el, { duration: duration, display: "block", transformOrigin: "50%", scaleY: 1, })
					: animation === "scaleX" ? gsap.to(el, { duration: duration, display: "block", transformOrigin: "50%", scaleX: 1, })
						: animation === "scale" ? gsap.to(el, { duration: duration, display: "block", transformOrigin: "50%", scale: 1, })
							: animation === "fade" ? gsap.to(el, { duration: duration, display: "block", opacity: 1, })
								: el.style.display = "block"
		}
	}
};
function tipAnimate(id) {
	gsap.timeline({ repeat: -1, repeatDelay: 4 })
		.to(id, { duration: 0.3, rotate: "90deg" })
		.to(id, { duration: 0.3, rotate: "-90deg" })
		.to(id, { duration: 0.3, rotate: "0deg" })
	return tipAnimate
};

