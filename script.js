
$(document).ready(_ => {
	$('#title1').animate({ bottom: "40%" }, 900)
	if (window.localStorage.getItem('lan') === "ar" || window.navigator.language.includes("ar") && window.localStorage.getItem('lan') === null) {
		changeLan();
		$("#arabic").text("English")
	}
	bodymovin.loadAnimation({
		container: document.getElementById('loading'),
		renderer: 'svg',
		loop: true,
		autoplay: true,
		path: 'data.json'
	});
});
let isLogged;
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
		document.getElementById('firebaseui-auth-container').style.display = 'none';
		document.getElementById('loading').style.display = 'block';
		// get user pic & name
		const profileImg = auth.currentUser.providerData.map(e => e.photoURL)[0]
		const displayName = auth.currentUser.providerData.map(e => e.displayName)[0]
		document.getElementById('profileImg').style.backgroundImage = `url(${profileImg})`
		document.getElementById('userName').innerHTML = displayName;
		// check if data exists
		const userUid = auth.currentUser.uid;
		const docRef = db.collection("users").doc(userUid);
		docRef.get().then(doc => {
			if (doc.exists) {
				// data exists
				user = doc.data()
				$("#page4").fadeIn(250).css("display", "block");
				$("#welcomePage").fadeOut(250).css("display", "none");
				$("#profile").fadeOut(250).css("display", "none");
				if (user.skipping === true) {
					bmi();
					HarrisBenedictBMR();
					activityMultipier();
					ibwBroca(); ""
					lbmBoer();
					tbw();
					document.getElementById("card3").style.display = "none";
					document.getElementById("card5").style.display = "none";
				} else {
					document.getElementById("card3").style.display = "block";
					document.getElementById("card5").style.display = "block";
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
				topage1();
			}
		}).catch(error => console.log("Error getting document:", error));
	} else {
		// not logged in
		isLogged = false
		$("#firebaseui-auth-container").fadeIn(1500).css("display", "block");
		document.getElementById('loading').style.display = 'none';

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
	auth.signOut().then(function () {
		location.reload();
	}).catch(function (error) {
		console.log(error)
	});
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
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		if (!isLogged) {
			setTimeout(() => {
				$("#addToHomePop").slideDown(200);
			}, 1500);
		}
	});
	document.getElementById('addToHomebutt').addEventListener('click', (e) => {
		$("#addToHomePop").css("visibility", "hidden");
		deferredPrompt.prompt();
	});
	document.documentElement.style.setProperty('--inner', window.innerHeight + 'px')
	window.addEventListener('resize', _ => document.documentElement.style.setProperty('--inner', window.innerHeight + 'px'))
}());

bmi = _ => {

	const bmi = user.system == "metric"
		? user.weight / Math.pow(user.height / 100, 2)
		: (703 * user.weight) / Math.pow(user.height, 2);

	const arrow = document.getElementById("arrow");
	if (bmi > 35) {
		$("#arrow").animate({ left: '243px' }, 1000);
	} else if (bmi < 0) {
		arrow.style.left = -7 + "px";
	} else {
		const bmibar = Math.round(bmi * 7.142857);
		$("#arrow").animate({ left: bmibar + 'px' }, 1000);
	}
	results.bmi = Number(bmi.toFixed(1));
	document.getElementById("bmi").innerHTML = results.bmi;
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
		document.getElementById("bmiRange").style.color = "#d0a50b";
		document.getElementById("bmiGoal").innerHTML = bmiGoalST[0];
	} else if (results.bmi >= 18.5 && 24.9 > results.bmi && user.age >= 20) {
		results.bmirange = bmiRangeST[1];
		document.getElementById("bmiRange").style.color = "#40ff45";
		document.getElementById("bmiGoal").innerHTML = bmiGoalST[1];
	} else if (results.bmi > 25 && 29.9 > results.bmi && user.age >= 20) {
		results.bmirange = bmiRangeST[2];
		document.getElementById("bmiRange").style.color = "#d0a50b";
		document.getElementById("bmiGoal").innerHTML = bmiGoalST[2];
	} else if (results.bmi > 30 && user.age >= 20) {
		results.bmirange = bmiRangeST[3];
		document.getElementById("bmiRange").style.color = "#dc2900";
		document.getElementById("bmiGoal").innerHTML = bmiGoalST[3];
	} else {
		results.bmirange = bmiRangeST[4];
	}
	document.getElementById("bmiRange").innerHTML = results.bmirange;
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
	document.getElementById("bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
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
	document.getElementById("bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
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
	document.getElementById("intake").innerHTML = `${results.dailykcal}<span style='font-size: 15px; color: white'>${kcalST}</span>`;
};

bmrmethod = _ => {
	if (document.getElementById("bmrmethod").value === "harris") {
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
	document.getElementById("whtr").innerHTML = results.whtr;
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
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[0];
			} else if (results.whtr > 0.35 && 0.42 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[1];
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[1];
			} else if (results.whtr > 0.43 && 0.52 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[2];
				document.getElementById("whtrRange").style.color = "#40ff45";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[2];
			} else if (results.whtr > 0.53 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[3];
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr > 0.58 && 0.62 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[4];
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr >= 0.63 && user.age >= 20) {
				results.whtrRange = whtrRangeST[5];
				document.getElementById("whtrGoal").innerHTML = whtrGoal[4];
				document.getElementById("whtrRange").style.color = "#dc2900";
			}
			break;

		case "female":
			if (results.whtr <= 0.34 && user.age >= 20) {
				results.whtrRange = whtrRangeST[0];
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[0];
			} else if (results.whtr > 0.35 && 0.41 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[1];
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[1];
			} else if (results.whtr > 0.42 && 0.48 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[2];
				document.getElementById("whtrRange").style.color = "#40ff45";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[2];
			} else if (results.whtr > 0.49 && 0.53 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[3];
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[3];
			} else if (results.whtr > 0.54 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = whtrRangeST[4];
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = whtrGoal[4];
			} else if (results.whtr >= 0.58 && user.age >= 20) {
				results.whtrRange = whtrRangeST[5];
				document.getElementById("whtrGoal").innerHTML = whtrGoal[4];
				document.getElementById("whtrRange").style.color = "#dc2900";
			}
			break;
	}

	if (results.whtr <= 0.34 && user.age < 20) {
		results.whtrRange = "Extremely Slim";
		document.getElementById("whtrRange").style.color = "#dc2900";
		document.getElementById("whtrGoal").innerHTML = "You Should Gain Weight";
	} else if (results.whtr > 0.35 && 0.45 > results.whtr && user.age < 20) {
		results.whtrRange = "Slim";
		document.getElementById("whtrRange").style.color = "#d0a50b";
		document.getElementById("whtrGoal").innerHTML = "You Should Gain Some Weight";
	} else if (results.whtr > 0.46 && 0.51 > results.whtr && user.age < 20) {
		results.whtrRange = "Healthy";
		document.getElementById("whtrRange").style.color = "#40ff45";
		document.getElementById("whtrGoal").innerHTML = "You Should Sustain Your Weight";
	} else if (results.whtr > 0.52 && 0.63 > results.whtr && user.age < 20) {
		results.whtrRange = "Overweight";
		document.getElementById("whtrRange").style.color = "#d0a50b";
		document.getElementById("whtrGoal").innerHTML = "You Should Lose Some Weight";
	} else if (results.whtr >= 0.64 && user.age < 20) {
		results.whtrRange = "Obese";
		document.getElementById("whtrRange").style.color = "#dc2900";
		document.getElementById("whtrGoal").innerHTML = "You Should Lose Weight";
	}

	document.getElementById("whtrRange").innerHTML = results.whtrRange;
};
let kiloST = " Kilograms"
let poundST = " Pounds"
ibwBroca = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height - 100;
				results.ibw = results.ibw - (results.ibw / 100 * 10);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height * 2.54;
				results.ibw = results.ibw - 100;
				results.ibw = results.ibw - (results.ibw / 100 * 10);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height - 100;
				results.ibw = results.ibw + (results.ibw / 100 * 15);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height * 2.54;
				results.ibw = results.ibw - 100;
				results.ibw = results.ibw + (results.ibw / 100 * 15);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};

ibwDevine = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 50 + (results.ibw * 2.3);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 50 + (results.ibw * 2.3);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 45.5 + (results.ibw * 2.3);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 45.5 + (results.ibw * 2.3);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};

ibwRobinson = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 52 + (results.ibw * 1.9);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 52 + (results.ibw * 1.9);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 49 + (results.ibw * 1.7);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 49 + (results.ibw * 1.7);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};

ibwMillier = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 56.2 + (results.ibw * 1.41);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 56.2 + (results.ibw * 1.41);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 53.1 + (results.ibw * 1.36);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 53.1 + (results.ibw * 1.36);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};

ibwHamwi = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 48 + (results.ibw * 2.7);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 48 + (results.ibw * 2.7);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 45.5 + (results.ibw * 2.2);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 45.5 + (results.ibw * 2.2);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
};

ibwLemmens = _ => {

	if (user.system === "metric") {
		results.ibw = 22 * Math.pow(user.height / 100, 2);
		results.ibw = Number(results.ibw.toFixed(1));
		document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
	} else if (user.system === "imperial") {
		results.ibw = user.height / 39.37;
		results.ibw = 22 * Math.pow(results.ibw, 2);
		results.ibw = results.ibw * 2.205;
		results.ibw = Number(results.ibw.toFixed(1));
		document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'>${poundST}</span>`;
	}
};

ibwmethod = _ => {
	const formula = document.getElementById("ibwmethod").value;
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
			results.bfp = 1.20 * results.bmi + 0.23 * user.age - 16.2;
			results.bfp = Number(results.bfp.toFixed(1));
			break;

		case ("female"):
			results.bfp = 1.20 * results.bmi + 0.23 * user.age - 5.4;
			results.bfp = Number(results.bfp.toFixed(1));
			break;
	}
	document.getElementById("bfpbmi").innerHTML = `${results.bfp}<span style='font-size: 18px; color: white'> %</span>`;
};

BFPnavy = _ => {

	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.bfp = 495 / (1.0324 - 0.19077 * Math.log10(user.waist - user.neck) + 0.15456 * Math.log10(user.height)) - 450;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;

			} else if (user.gender === "female") {
				results.bfp = 495 / (1.29579 - 0.35004 * Math.log10(user.waist + user.hip - user.neck) + 0.22100 * Math.log10(user.height)) - 450;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${kiloST}</span>`;

			}
			break;

		case "imperial":
			if (user.gender === "male") {
				results.bfp = 86.010 * Math.log10(user.waist - user.neck) - 70.041 * Math.log10(user.height) + 36.76;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${poundST}</span>`;

			} else if (user.gender === "female") {
				results.bfp = 163.205 * Math.log10(user.waist + user.hip - user.neck) - 97.684 * Math.log10(user.height) - 78.387;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'>${poundST}</span>`;
			}
			break;
	}
	document.getElementById("bfp").innerHTML = `${results.bfp}<span style='font-size: 18px; color: white'> %</span>`;
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
	document.getElementById("bfpRange").innerHTML = results.bfprange;
};

lbmBoer = _ => {

	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = (0.407 * user.weight) + (0.267 * user.height) - 19.2;
				results.lbm = Number(results.lbm.toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = (0.252 * user.weight) + (0.473 * user.height) - 48.3;
				results.lbm = Number(results.lbm.toFixed(1));
			}

			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;

		case "imperial":
			var heightcm = user.height * 2.54;
			var weightkg = user.weight / 2.205;
			if (user.gender === "male") {
				results.lbm = (0.407 * weightkg) + (0.267 * heightcm) - 19.2;
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));

			} else if (user.gender === "female") {
				results.lbm = (0.252 * weightkg) + (0.473 * heightcm) - 48.3;
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));
			}
			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = 100 - results.lbmP;
	results.lbmF = Number(results.lbmF.toFixed(1));
	document.getElementById("lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	document.getElementById("lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};

lbmJames = _ => {

	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = (1.1 * user.weight) - 128 * Math.pow((user.weight / user.height), 2);
				results.lbm = Number(results.lbm.toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = (1.07 * user.weight) - 148 * Math.pow((user.weight / user.height), 2);
				results.lbm = Number(results.lbm.toFixed(1));
			}

			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;

		case "imperial":
			var heightcm = user.height * 2.54;
			var weightkg = user.weight / 2.205;

			if (user.gender === "male") {
				results.lbm = (1.1 * weightkg) - 128 * Math.pow((weightkg / heightcm), 2);
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = (1.07 * weightkg) - 148 * Math.pow((weightkg / heightcm), 2);
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));
			}

			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = 100 - results.lbmP;
	results.lbmF = Number(results.lbmF.toFixed(1));
	document.getElementById("lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	document.getElementById("lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};

lbmHume = _ => {

	switch (user.system) {
		case "metric":
			if (user.gender === "male") {
				results.lbm = (0.32810 * user.weight) + (0.33929 * user.height) - 29.5336;
				results.lbm = Number(results.lbm.toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = (0.29569 * user.weight) + (0.41813 * user.height) - 43.2933;
				results.lbm = Number(results.lbm.toFixed(1));
			}

			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${kiloST}</span>`;
			break;

		case "imperial":
			var heightcm = user.height * 2.54;
			var weightkg = user.weight / 2.205;

			if (user.gender === "male") {
				results.lbm = (0.32810 * weightkg) + (0.33929 * heightcm) - 29.5336;
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));
			} else if (user.gender === "female") {
				results.lbm = (0.29569 * weightkg) + (0.41813 * heightcm) - 43.2933;
				results.lbm = results.lbm * 2.205;
				results.lbm = Number(results.lbm.toFixed(1));
			}
			results.lbmP = (results.lbm * 100) / user.weight;
			results.lbmP = Number(results.lbmP.toFixed(1));
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'>${poundST}</span>`;
			break;
	}
	results.lbmF = 100 - results.lbmP;
	results.lbmF = Number(results.lbmF.toFixed(1));
	document.getElementById("lbmP").innerHTML = `${results.lbmP}<span style='font-size: 18px; color: white'> %</span>`;
	document.getElementById("lbmF").innerHTML = `${results.lbmF}<span style='font-size: 18px; color: white'> %</span>`;
};

lbmmethod = _ => {
	const formula = document.getElementById("lbmmethod").value;
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
	document.getElementById("tbw").innerHTML = `${results.tbw}<span style='font-size: 18px; color: white'>${tbwST}</span>`;
};

topage1 = _ => {
	$("#page1").fadeIn(250).css("display", "block");
	$("#page4").fadeOut(250).css("display", "none");
	$("#welcomePage").fadeOut(250).css("display", "none");
	$("#profile").fadeOut(250).css("display", "block");
	$("#back").fadeOut(250).css("display", "none");
};

topage2 = _ => {
	const age = document.getElementById("age").value;
	const weight = document.getElementById("weight").value;
	const height = document.getElementById("height").value;
	const gender = document.getElementById("mgender").checked;
	const selectsys = document.getElementById("metric").checked;

	user.gender = gender === true ? "male" : "female";
	user.system = selectsys === true ? "metric" : "imperial";
	user.age = Number(age);
	user.weight = Number(weight);
	user.height = Number(height);

	switch (user.system) {
		case "metric":
			if (age < 18 || age > 120) {
				$("#agealert").slideToggle(100);
			} else if (weight < 20 || weight > 250) {
				$("#weightalert").slideToggle(100);
			} else if (height < 91 || height > 360) {
				$("#heightalert").slideToggle(100);
			} else {
				$("#page2").fadeIn(250).css("display", "block");
				$("#page1").fadeOut(250).css("display", "none");
				$("#back").fadeIn(250).css("display", "block");

			}
			break;

		case "imperial":
			if (age < 18 || age > 120) {
				$("#agealert").slideToggle(100);
			} else if (weight < 45 || weight > 560) {
				$("#weightalert").slideToggle(100);
			} else if (height < 47 || height > 155) {
				$("#heightalert").slideToggle(100);
			} else {
				$("#page2").fadeIn(250).css("display", "block");
				$("#page1").fadeOut(250).css("display", "none");
				$("#back").fadeIn(250).css("display", "block");

			}
			break;
	}
};

topage3 = _ => {

	const neck = document.getElementById("neck").value;
	const waist = document.getElementById("waist").value;
	const hip = document.getElementById("hip").value;
	user.neck = Number(neck);
	user.waist = Number(waist);
	user.hip = Number(hip);

	switch (user.system) {
		case "metric":
			if (neck < 25 || neck > 245) {
				$("#neckalert").slideToggle(100);
			} else if (waist < 56 || waist > 250) {
				$("#waistalert").slideToggle(100);
			} else if (hip < 64 || hip > 250) {
				$("#hipalert").slideToggle(100);
			} else {
				$("#page3").fadeIn(250).css("display", "block");
				$("#page2").fadeOut(250).css("display", "none");
			}
			break;
		case "imperial":
			if (neck < 10 || neck > 100) {
				$("#neckalert").slideToggle(100);
			} else if (waist < 22 || waist > 100) {
				$("#waistalert").slideToggle(100);
			} else if (hip < 25 || hip > 100) {
				$("#hipalert").slideToggle(100);
			} else {
				$("#page3").fadeIn(250).css("display", "block");
				$("#page2").fadeOut(250).css("display", "none");
			}
			break;
	}
	user.skipping = false;
};

topage4 = _ => {

	$("#page4").fadeIn(250).css("display", "block");
	$("#page3").fadeOut(250).css("display", "none");
	$("#profile").fadeOut(250).css("display", "none");

	const sedentary = document.getElementById("sedentary");
	const light = document.getElementById("light");
	const moderate = document.getElementById("moderate");
	const very = document.getElementById("very");
	const extra = document.getElementById("extra");

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
		document.getElementById("card3").style.display = "none";
		document.getElementById("card5").style.display = "none";

	} else {
		document.getElementById("card3").style.display = "block";
		document.getElementById("card5").style.display = "block";
		bmi();
		HarrisBenedictBMR();
		activityMultipier();
		whtr();
		ibwBroca();
		BFPnavy();
		lbmBoer();
		tbw();
	}
	// upload data
	const userUid = auth.currentUser.uid;
	db.collection("users").doc(userUid).set(user);
};

skip = _ => {
	$("#page3").fadeIn(250).css("display", "block");
	$("#page2").fadeOut(250).css("display", "none");
	$("#skippop").toggle(100);
	user.skipping = true;
};

toback = _ => {
	if (document.getElementById("page2").style.display === "block") {
		$("#page1").fadeIn(250).css("display", "block");
		$("#page2").fadeOut(250).css("display", "none");
		$("#back").fadeOut(250).css("display", "none");
	} else if (document.getElementById("page3").style.display === "block") {
		$("#page2").fadeIn(250).css("display", "block");
		$("#page3").fadeOut(250).css("display", "none");
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
	document.getElementById("weight").placeholder = metricStrings[0];
	document.getElementById("height").placeholder = metricStrings[1];
	document.getElementById("neck").placeholder = metricStrings[2];
	document.getElementById("waist").placeholder = metricStrings[3];
	document.getElementById("hip").placeholder = metricStrings[4];
};
let imperialStrings = [
	"Your Weight In Pounds",
	"Your Height In Inches",
	"Your Neck Size In Inches",
	"Your Waist Size In Inches",
	"Your Hip Size In Inches",
]
imperialSystem = _ => {
	document.getElementById("weight").placeholder = imperialStrings[0];
	document.getElementById("height").placeholder = imperialStrings[1];
	document.getElementById("neck").placeholder = imperialStrings[2];
	document.getElementById("waist").placeholder = imperialStrings[3];
	document.getElementById("hip").placeholder = imperialStrings[4]
};

addToHomePop = _ => $("#addToHomePop").slideToggle(100);
bmipop = _ => $("#bmipop").slideToggle(100);
bmrpop = _ => $("#bmrpop").slideToggle(100);
whtrpop = _ => $("#whtrpop").slideToggle(100);
ibwpop = _ => $("#ibwpop").slideToggle(100);
bfppop = _ => $("#bfppop").slideToggle(100);
lbmpop = _ => $("#lbmpop").slideToggle(100);
tbwpop = _ => $("#tbwpop").slideToggle(100);
neckpop = _ => $("#neckpop").slideToggle(100);
waistpop = _ => $("#waistpop").slideToggle(100);
hippop = _ => $("#hippop").slideToggle(100);
agealert = _ => $("#agealert").slideToggle(100);
weightalert = _ => $("#weightalert").slideToggle(100);
heightalert = _ => $("#heightalert").slideToggle(100);
neckalert = _ => $("#neckalert").slideToggle(100);
waistalert = _ => $("#waistalert").slideToggle(100);
hipalert = _ => $("#hipalert").slideToggle(100);
skippop = _ => $("#skippop").slideToggle(100);
changeLan = _ => {
	const font = isMobile() ? "'Tajawal', sans-serif" : "Arial, Helvetica, sans-serif"
	$(body).css("font-family", font)
	$("button").css("font-family", font)
	// Main Page
	$(".calculator").text("حاسبة مقاييس الجسم")
	$("#addToHomePop > h3").text("هل تريد تثبيت التطبيق مجاناً")
	$("#addToHomebutt").text("تثبيت")
	$(".notnow").text("ليس الآن")
	$(".topage").text("التالي")
	setTimeout ( _ => {
		$(".firebaseui-idp-google > .firebaseui-idp-text-long").text("تسجيل الدخول عن طريق جوجل")
		$(".firebaseui-idp-google > .firebaseui-idp-text-short").text("جوجل")
		$(".firebaseui-idp-facebook > .firebaseui-idp-text-long").text("تسجيل الدخول عن طريق فيسبوك")
		$(".firebaseui-idp-facebook > .firebaseui-idp-text-short").text("فيسبوك")
		$(".firebaseui-idp-password > .firebaseui-idp-text-long").text("تسجيل الدخول عن طريق الإيميل")
		$(".firebaseui-idp-password > .firebaseui-idp-text-short").text("إيميل")
		$(".firebaseui-idp-text").css("font-family", font).css("text-align", "right").css("padding-right", "16px").css("padding-left", "0")
		$(".firebaseui-idp-button").css("max-width", "300px").css("direction", "rtl")
	} ,300) 
	// Page1
	$(".ipg > h3:nth-child(1)").text("اختر نظام القياس")
	$(".ipg > h3:nth-child(6)").text("اختر الجنس")
	$(".ipg > label:nth-child(2)").html(`متري<input id = "metric" type = "radio" name = "system" checked = "checked" ><span class="checkmark"></span>`)
	$(".ipg > label:nth-child(3)").html(`إنجليزي<input id="imperial" type="radio" name="system"><span class="checkmark"></span>`)
	$(".ipg > label:nth-child(7)").html(`ذكر<input id="mgender" type="radio" name="gender" checked="checked"><span class="checkmark"></span>`)
	$(".ipg > label:nth-child(8)").html(`انثى<input id="fgender" type="radio" name="gender"><span class="checkmark"></span>`)
	$(".ipg3 > h2:nth-child(1)").text("العمر")
	$(".ipg3 > h2:nth-child(5)").text("الوزن")
	$(".ipg3 > h2:nth-child(9)").text("الطول")
	$("#page1 h2").css("text-align", "right")
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
	$('input').css("direction", "rtl")
	document.getElementById("age").placeholder = "عمرك";
	document.getElementById("weight").placeholder = metricStrings[0];
	document.getElementById("height").placeholder = metricStrings[1];
	// Page2
	document.getElementById("neck").placeholder = metricStrings[2];
	document.getElementById("waist").placeholder = metricStrings[3];
	document.getElementById("hip").placeholder = metricStrings[4];
	$("#page2 > h1:nth-child(2)").text("لمزيد من النتائج الدقيقة")
	$(".ipg6 > h2:nth-child(4)").text("محيط الرقبة")
	$(".ipg6 > h2:nth-child(8)").text("محيط الخصر")
	$(".ipg6 > h2:nth-child(12)").text("محيط الورك")
	$("#page2 h2").css("text-align", "right")
	$("#necktip").css("left", "7px")
	$("#waisttip").css("left", "7px")
	$("#hiptip").css("left", "7px")
	$(".skip").text("تخطي")
	// popUps
	// Page1 PopUps
	$("#agealert > h3").text("تحذير")
	$("#agealert > p").text("الرجاء إدخال عمر فوق سن 18")
	$("#agealert > button").text("حسناً")
	$("#weightalert > h3").text("تحذير")
	$("#weightalert > p").text("الرجاء إدخال الوزن بشكل صحيح")
	$("#weightalert > button").text("حسناً")
	$("#heightalert > h3").text("تحذير")
	$("#heightalert > p").text("الرجاء إدخال الطول بشكل صحيح")
	$("#heightalert > button").text("حسناً")
	// Page2 PopUps
	$("#neckalert > h3").text("تحذير")
	$("#neckalert > p").text("الرجاء إدخال محيط الرقبة بشكل صحيح")
	$("#neckalert > button").text("حسناً")

	$("#waistalert > h3").text("تحذير")
	$("#waistalert > p").text("الرجاء إدخال محيط الخصر بشكل صحيح")
	$("#waistalert > button").text("حسناً")

	$("#hipalert > h3").text("تحذير")
	$("#hipalert > p").text("الرجاء إدخال محيط الورك بشكل صحيح")
	$("#hipalert > button").text("حسناً")

	$("#neckpop > h3").text("قياس الرقبة")
	$("#neckpop > h3").css("text-align", "right")
	$("#neckpop > p").text(`لف شريط القياس حول الرقبة ، بدءً من إنش واحد تقريباً من مكان التقاء رقبتك بكتفيك. الذي قد يتوازى مع الجزء السفلي من الحنجرة. تأكد أن شريط القياس ليس مرخياً و أن الشريط مستوي وليس مائلاً.`)
	$("#neckpop > p").css("text-align", "right")
	$("#neckpop > p").css("direction", "rtl")
	$("#neckpop > button").text("حسناً")

	$("#waistpop > h3").text("قياس الخصر")
	$("#waistpop > h3").css("text-align", "right")
	$("#waistpop > p").text(`ابدأ من الجزء العلوي من عظم الفخذ ، ثم لف شريط القياس حول  جسمك على مستوى زر البطن. تأكد من أن الشريط ليس ضيق جداً وأنه مستقيم في الخلف والأمام  وألا تحبس نفسك أثناء القياس. ثم تحقق من الرقم الموجود على شريط القياس مباشرة بعد الزفير.`)
	$("#waistpop > p").css("text-align", "right")
	$("#waistpop > p").css("direction", "rtl")
	$("#waistpop > button").text("حسناً")

	$("#hippop > h3").text("قياس الورك")
	$("#hippop > h3").css("text-align", "right")
	$("#hippop > p").text(`الخصر هو أضيق جزء من الجذع ، حيث ينحني الجسم عنده. الورك يكون تحت الخصر وعادة ما يكون أوسع من الخصر. قياس الورك يتضمن المؤخرة والفخذين حيث يؤخذ القياس من أوسع منطقة من الورك.`)
	$("#hippop > p").css("text-align", "right")
	$("#hippop > p").css("direction", "rtl")
	$("#hippop > button").text("حسناً")

	$("#skippop > h3").text("هل أنت متأكد؟")
	$("#skippop > h3").css("text-align", "right")
	$("#skippop > p").text(`من خلال تخطي إدخال مقاييس الرقبة والخصر والورك لن تكون قادر على حساب نسبة الخصر إلى الطول (WtHR) ونسبة الدهون في الجسم (BFP).`)
	$("#skippop > p").css("text-align", "right")
	$("#skippop > p").css("direction", "rtl")
	$("#cancel").css("left", "7px")
	$("#skippop > button").text("تخطي")
	// Page4 PopUps
	$("#bmipop > h3").text("مؤشر كتلة الجسم")
	$("#bmipop > p").text(`يمكن لمؤشر كتلة الجسم إخبارك بالوزن الزائد ولكن لا يمكن أن يكون  معياراً دقيقاً لاخبارك بوزن الدهون الزائدة لأنه لا يميز الفرق بين الوزن الزائد للعضلات أو للدهون أو للعظام . على عكس الأطفال ،  مؤشر كتلة الجسم للبالغين لا يتأثر بالعمر أو الجنس أو الكتلة العضلية. الحمل يؤثر أيضاً على مؤشر كتلة الجسم لهذا السبب يجب استخدام الوزن ما قبل الحمل لحساب مؤشر كتلة الجسم.`)
	$("#bmipop > p").css("direction", "rtl")
	$("#bmipop > p").css("text-align", "right")
	$("#bmipop > button").text("حسناً")

	$("#bmrpop > h3").text("معدل الاستقلاب الأساسي")
	$("#bmrpop > p").text(`معدل الأيض الأساسي أو معدل الاستقلاب الأساسي هو القيمة التي تستخدم لوصف الاستقلاب (الأيض) ، وهي قيمة الطاقة التي يتطلبها الجسم خلال يوم واحد لإعادة صيانة وظيفته في حين يكون الجسم في حالة راحة تامة وفي حال اليقظة صباحاً وفي حالة عدم نشاط عملية الهضم وتحت درجة الحرارة العادية للغرفة ( 28 درجة مئوية).`)
	$("#bmrpop > p").css("direction", "rtl")
	$("#bmrpop > p").css("text-align", "right")
	$("#bmrpop > button").text("حسناً")

	$("#whtrpop > h3").text("نسبة الخصر إلى الطول")
	$("#whtrpop > p").text(`نسبة الخصر إلى الطول تشير بشكل فعال إلى خطر السمنة المركزي وخطر على القلب. نسبة الخصر إلى الطول هو مقياس لتوزع الدهون في الجسم. حيث تشير القيم العالية إلى زيادة خطر الإصابة بأمراض القلب والأوعية الدموية المرتبطة بالسمنة.`)
	$("#whtrpop > p").css("direction", "rtl")
	$("#whtrpop > p").css("text-align", "right")
	$("#whtrpop > button").text("حسناً")

	$("#ibwpop > h3").text("الوزن المثالي للجسم")
	$("#ibwpop > p").text(`يشير IBW  إلى الوزن المثالي للجسم استنادًا إلى جنسك وطولك. يتم استخدام صيغ مختلفة لحساب IBW. يمكنك تغيير الصيغة من القائمة المنسدلة.`)
	$("#ibwpop > p").css("direction", "rtl")
	$("#ibwpop > p").css("text-align", "right")
	$("#ibwpop > button").text("حسناً")

	$("#bfppop > h3").text("نسبة دهون الجسم")
	$("#bfppop > p").text(`من الناحية العلمية ، تعرف الدهون في الجسم باسم "الأنسجة الدهنية" ، والتي تشمل الدهون الأساسية   والدهون المخزنة في الجسم. الدهون الأساسية في الجسم هي المسؤولة عن الحفاظ على وظائف الحياة والتكاثر ، في حين أن الدهون المخزنة هي الدهون التي تتراكم في الأنسجة الدهنية. في حين أن بعض الدهون المخزنة مفيدة، إلا أن زيادة الدهون المخزنة يمكن أن تؤدي إلى آثار صحية خطيرة. يختلف معدل تراكم الدهون في الجسم من شخص لآخر ، وهذا يتوقف على العوامل الوراثية والسلوكية المختلفة ، بما في ذلك ممارسة الرياضة وتناول الطعام. بسبب اختلاف العوامل ، فقد يكون فقدان الدهون في الجسم أمراً صعباً بالنسبة لبعض الأشخاص. ومع ذلك ، يمكن لإدارة النظام الغذائي وممارسة الرياضة أن تساعد في الحد من الدهون. يختلف كل من الرجال والنساء في أماكن تخزين الدهون في الجسم. بعد سن الأربعين (أو بعد انقطاع الطمث عند النساء) ، يمكن أن يؤدي انخفاض الهرمونات الجنسية إلى زيادة الدهون في الجسم حول المعدة عند الرجال أو الفخذين والأرداف عند النساء.`)
	$("#bfppop > p").css("direction", "rtl")
	$("#bfppop > p").css("text-align", "right")
	$("#bfppop > button").text("حسناً")

	$("#lbmpop > h3").text("كتلة العضلات في الجسم")
	$("#lbmpop > p").text(`تقوم حاسبة (LBM) بحساب كتلة العضلات في الجسم المقدرة للشخص بناءً على وزن الجسم والطول والجنس والعمر. لأغراض المقارنة ، توفر الآلة الحاسبة معادلات متعددة.`)
	$("#lbmpop > p").css("direction", "rtl")
	$("#lbmpop > p").css("text-align", "right")
	$("#lbmpop > button").text("حسناً")

	$("#tbwpop > h3").text("الحجم الكلي للمياه في الجسم")
	$("#tbwpop > p").text(`تستخدم حاسبة حجم المياه الكلي في الجسم العمر والطول والوزن والجنس لتقدير حجم الماء في جسمك. لأنه يقوم على صيغة وضعها الدكتور واتسون وفريقه والتي وصفت في عام 1980.`)
	$("#tbwpop > p").css("direction", "rtl")
	$("#tbwpop > p").css("text-align", "right")
	$("#tbwpop > button").text("حسناً")
	// Page3
	$(".ipg9 > h1:nth-child(1)").text("اختر مستوى نشاطك")
	$(".ipg9 > h4:nth-child(3)").text("نشاط قليل من دون أي تمارين رياضية كالعمل في مكتب")
	$(".ipg9 > h4:nth-child(5)").text("تمارين رياضية بسيطة 1-3 أيام بالأسبوع")
	$(".ipg9 > h4:nth-child(7)").text("تمارين رياضية متوسطة 6-7 أيام بالأسبوع")
	$(".ipg9 > h4:nth-child(9)").text("تمارين صعبة كل يوم")
	$(".ipg9 > h4:nth-child(11)").text("تمارين صعبة مرتين أو أكثر كل يوم")
	$(".ipg9 > label:nth-child(2)").html(`كثير الجلوس<input id="sedentary" type="radio" name="activity" checked="checked" style="direction: rtl;"><span class="checkmark1"></span>`)
	$(".ipg9 > label:nth-child(4)").html(`قليل النشاط<input id="light" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`)
	$(".ipg9 > label:nth-child(6)").html(`متوسط النشاط<input id="moderate" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`)
	$(".ipg9 > label:nth-child(8)").html(`كثير النشاط<input id="very" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`)
	$(".ipg9 > label:nth-child(10)").html(`عالي النشاط<input id="extra" type="radio" name="activity" style="direction: rtl;"><span class="checkmark1"></span>`)
	$("#page3 > .topage").text("أحسب")
	// infoCard
	$("#EditButton").text("تعديل المقاييس")
	$("#SignOut").text("تسجيل الخروج")
	// BMI Card
	$("#card1 > h2:nth-child(3)").text("مؤشر كتلة جسم")
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
	$("#card2 > h4:nth-child(3)").text("المعادلة المستخدمة في الحساب")
	$("#card2 > h2:nth-child(7)").text("معدل الاستقلاب الأساسي")
	kcalST = " سعرة في يوم "
	$("#bmr").css("direction", "rtl")
	$("#intake").css("direction", "rtl")
	$("#card2 > h2:nth-child(10)").text("السعرات الحرارية اليومية")
	$("#card2 > h3:nth-child(11)").text("وفقاً لنشاطك اليومي")
	// WHtR Card
	$("#card3 > h2:nth-child(3)").text("نسبة الخصر إلى الطول")
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
	$("#card4 > h4:nth-child(4)").text("المعادلة المستخدمة في الحساب")
	$("#card4 > h2:nth-child(8)").text("الوزن المثالي للجسم")
	$("#ibw").css("direction", "rtl")
	kiloST = " كيلوغرام "
	poundST = " باوند "
	// BFP Card
	$("#card5 > h2:nth-child(4)").text("دهون الجسم (طريقة البحرية الأمريكية)")
	$("#card5 > h2:nth-child(4)").css("font-size", "18px")
	$("#card5 > h1:nth-child(5)").css("direction", "rtl")
	$("#card5 > h2:nth-child(6)").text("التصنيف حسب نسبة الدهون")
	$("#card5 > h2:nth-child(8)").text("كتلة الدهون في الجسم")
	$("#card5 > h2:nth-child(10)").text("كتلة العضلات في الجسم")
	$("#card5 > h2:nth-child(12)").text("دهون الجسم (طريقة مؤشر كتلة الجسم)")
	$("#card5 > h2:nth-child(12)").css("font-size", "18px")
	$("#card5 > h1:nth-child(13)").css("direction", "rtl")
	bfprangeST = [
		"نسبة دهون الضرورية",
		"رياضي",
		"رشيق",
		"عادي",
		"بدانة",
	];
	$("#bfpFM").css("direction", "rtl")
	$("#bfpLM").css("direction", "rtl")
	// LBM Card
	$("#card6 > h4:nth-child(4)").text("المعادلة المستخدمة في الحساب")
	$("#card6 > h2:nth-child(8)").text("كتلة العضلات في الجسم")
	$("#card6 > h2:nth-child(10)").text("نسبة كتلة العضلات في الجسم")
	$("#card6 > h1:nth-child(11)").css("direction", "rtl")
	$("#card6 > h2:nth-child(12)").text("نسبة كتلة الدهون في الجسم")
	$("#card6 > h1:nth-child(13)").css("direction", "rtl")
	$("#lbm").css("direction", "rtl")
	// TBW
	$("#card7 > h2:nth-child(3)").text("الحجم الكلي للمياه في الجسم")
	$("#tbw").css("direction", "rtl")
	tbwST = " لتر "
}
changeLanButton = _ => {
	if ($("#arabic").text() === "English") {
		window.localStorage.setItem("lan", "en")
		location.reload();
	} else {
		window.localStorage.setItem("lan", "ar")
		location.reload();
	}
}
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
}