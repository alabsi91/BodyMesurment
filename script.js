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
auth.onAuthStateChanged(function (users) {
	if (users) {
		console.log('logged in')
		document.getElementById('firebaseui-auth-container').style.display = 'none';
		const profileImg = auth.currentUser.providerData.map(e => e.photoURL)[0]
		const displayName = auth.currentUser.providerData.map(e => e.displayName)[0]
		document.getElementById('profileImg').style.backgroundImage = `url(${profileImg})`
		document.getElementById('userName').innerHTML = displayName;

		// check if data exists
		document.getElementById('firebaseui-auth-container').style.display = 'none';
		const userUid = auth.currentUser.uid;
		const docRef = db.collection("users").doc(userUid);
		docRef.get().then(function (doc) {
			if (doc.exists) {
				user = doc.data()
				console.log(user)
				$("#page4").fadeIn(250).css("display", "block");
				$("#welcomePage").fadeOut(250).css("display", "none");
				$("#profile").fadeOut(250).css("display", "none");
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
			} else {
				console.log("No such document!");
				topage1();
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});
	} else {
		console.log('not logged in')
		document.getElementById('firebaseui-auth-container').style.display = 'block';
	}
});
// signout function
signOut = _ => {
	auth.signOut().then(function () {
		location.reload();
		console.log('out')
	}).catch(function (error) {
		console.log(error)
	});
}
// login ui
const uiConfig = {
	callbacks: {
		signInSuccessWithAuthResult: function (authResult, redirectUrl) {
			//document.getElementById('bm').style.display = 'block'
			return false;
		},
		uiShown: function () {
			//document.getElementById('loader').style.display = 'none';
		}
	},
	signInFlow: 'popup',
	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		firebase.auth.EmailAuthProvider.PROVIDER_ID,
	],
};
ui.start('#firebaseui-auth-container', uiConfig);

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
		deferredPrompt = e;
		$("#addToHomePop").slideToggle(100);
	});
	document.getElementById('addToHomebutt').addEventListener('click', (e) => {
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

bmiRange = _ => {
	if (results.bmi < 18.5 && user.age >= 20) {
		results.bmirange = "Underweight";
		document.getElementById("bmiRange").style.color = "#d0a50b";
		document.getElementById("bmiGoal").innerHTML = "You Should Gain Some Weight";
	} else if (results.bmi >= 18.5 && 24.9 > results.bmi && user.age >= 20) {
		results.bmirange = "Normal Weight";
		document.getElementById("bmiRange").style.color = "#40ff45";
		document.getElementById("bmiGoal").innerHTML = "You Should Sustain Your Weight";
	} else if (results.bmi > 25 && 29.9 > results.bmi && user.age >= 20) {
		results.bmirange = "Overweight";
		document.getElementById("bmiRange").style.color = "#d0a50b";
		document.getElementById("bmiGoal").innerHTML = "You Should Lose Some Weight";
	} else if (results.bmi > 30 && user.age >= 20) {
		results.bmirange = "Obese";
		document.getElementById("bmiRange").style.color = "#dc2900";
		document.getElementById("bmiGoal").innerHTML = "You Should Lose Weight";
	} else {
		results.bmirange = "Child or Teen";
	}
	document.getElementById("bmiRange").innerHTML = results.bmirange;
};

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
	document.getElementById("bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'> kcal/day</span>`;
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
	document.getElementById("bmr").innerHTML = `${results.bmr}<span style='font-size: 15px; color: white'> kcal/day</span>`;
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
	document.getElementById("intake").innerHTML = `${results.dailykcal}<span style='font-size: 15px; color: white'> kcal/day</span>`;
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

whtrRange = _ => {
	switch (user.gender) {
		case "male":
			if (results.whtr <= 0.34 && user.age >= 20) {
				results.whtrRange = "Extremely Slim";
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = "You Should Gain Weight";
			} else if (results.whtr > 0.35 && 0.42 > results.whtr && user.age >= 20) {
				results.whtrRange = "Slim";
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = "You Should Gain Some Weight";
			} else if (results.whtr > 0.43 && 0.52 > results.whtr && user.age >= 20) {
				results.whtrRange = "Healthy";
				document.getElementById("whtrRange").style.color = "#40ff45";
				document.getElementById("whtrGoal").innerHTML = "You Should Sustain Your Weight";
			} else if (results.whtr > 0.53 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = "Overweight";
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Some Weight";
			} else if (results.whtr > 0.58 && 0.62 > results.whtr && user.age >= 20) {
				results.whtrRange = "Very overweight";
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Some Weight";
			} else if (results.whtr >= 0.63 && user.age >= 20) {
				results.whtrRange = "Obese";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Weight";
				document.getElementById("whtrRange").style.color = "#dc2900";
			}
			break;

		case "female":
			if (results.whtr <= 0.34 && user.age >= 20) {
				results.whtrRange = "Extremely Slim";
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = "You Should Gain Weight";
			} else if (results.whtr > 0.35 && 0.41 > results.whtr && user.age >= 20) {
				results.whtrRange = "Slim";
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = "You Should Gain Some Weight";
			} else if (results.whtr > 0.42 && 0.48 > results.whtr && user.age >= 20) {
				results.whtrRange = "Healthy";
				document.getElementById("whtrRange").style.color = "#40ff45";
				document.getElementById("whtrGoal").innerHTML = "You Should Sustain Your Weight";
			} else if (results.whtr > 0.49 && 0.53 > results.whtr && user.age >= 20) {
				results.whtrRange = "Overweight";
				document.getElementById("whtrRange").style.color = "#d0a50b";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Some Weight";
			} else if (results.whtr > 0.54 && 0.57 > results.whtr && user.age >= 20) {
				results.whtrRange = "Very overweight";
				document.getElementById("whtrRange").style.color = "#dc2900";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Weight";
			} else if (results.whtr >= 0.58 && user.age >= 20) {
				results.whtrRange = "Obese";
				document.getElementById("whtrGoal").innerHTML = "You Should Lose Weight";
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

ibwBroca = _ => {

	switch (user.gender) {
		case "male":
			if (user.system === "metric") {
				results.ibw = user.height - 100;
				results.ibw = results.ibw - (results.ibw / 100 * 10);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height * 2.54;
				results.ibw = results.ibw - 100;
				results.ibw = results.ibw - (results.ibw / 100 * 10);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height - 100;
				results.ibw = results.ibw + (results.ibw / 100 * 15);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height * 2.54;
				results.ibw = results.ibw - 100;
				results.ibw = results.ibw + (results.ibw / 100 * 15);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
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
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 50 + (results.ibw * 2.3);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 45.5 + (results.ibw * 2.3);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 45.5 + (results.ibw * 2.3);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
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
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 52 + (results.ibw * 1.9);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 49 + (results.ibw * 1.7);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 49 + (results.ibw * 1.7);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
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
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 56.2 + (results.ibw * 1.41);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 53.1 + (results.ibw * 1.36);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 53.1 + (results.ibw * 1.36);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
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
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 48 + (results.ibw * 2.7);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;

		case "female":
			if (user.system === "metric") {
				results.ibw = user.height / 2.54;
				results.ibw = results.ibw - 60;
				results.ibw = 45.5 + (results.ibw * 2.2);
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
			} else if (user.system === "imperial") {
				results.ibw = user.height - 60;
				results.ibw = 45.5 + (results.ibw * 2.2);
				results.ibw = results.ibw * 2.205;
				results.ibw = Number(results.ibw.toFixed(1));
				document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;
	}
};

ibwLemmens = _ => {

	if (user.system === "metric") {
		results.ibw = 22 * Math.pow(user.height / 100, 2);
		results.ibw = Number(results.ibw.toFixed(1));
		document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Kilograms</span>`;
	} else if (user.system === "imperial") {
		results.ibw = user.height / 39.37;
		results.ibw = 22 * Math.pow(results.ibw, 2);
		results.ibw = results.ibw * 2.205;
		results.ibw = Number(results.ibw.toFixed(1));
		document.getElementById("ibw").innerHTML = `${results.ibw}<span style='font-size: 15px; color: white'> Pounds</span>`;
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

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'> Kilograms</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'> Kilograms</span>`;

			} else if (user.gender === "female") {
				results.bfp = 495 / (1.29579 - 0.35004 * Math.log10(user.waist + user.hip - user.neck) + 0.22100 * Math.log10(user.height)) - 450;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'> Kilograms</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'> Kilograms</span>`;

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

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'> Pounds</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'> Pounds</span>`;

			} else if (user.gender === "female") {
				results.bfp = 163.205 * Math.log10(user.waist + user.hip - user.neck) - 97.684 * Math.log10(user.height) - 78.387;
				results.bfp = Number(results.bfp.toFixed(1));

				results.bfpFM = (results.bfp / 100) * user.weight;
				results.bfpFM = Number(results.bfpFM.toFixed(1));

				results.bfpLM = user.weight - results.bfpFM;
				results.bfpLM = Number(results.bfpLM.toFixed(1));

				document.getElementById("bfpFM").innerHTML = `${results.bfpFM}<span style='font-size: 15px; color: white'> Pounds</span>`;
				document.getElementById("bfpLM").innerHTML = `${results.bfpLM}<span style='font-size: 15px; color: white'> Pounds</span>`;
			}
			break;
	}
	document.getElementById("bfp").innerHTML = `${results.bfp}<span style='font-size: 18px; color: white'> %</span>`;
	bfprange();
	BFPbmi();
};

bfprange = _ => {

	switch (user.gender) {
		case "male":
			if (results.bfp >= 2 && results.bfp <= 5) {
				results.bfprange = "Essential Fat";
			} else if (results.bfp > 5 && results.bfp <= 13) {
				results.bfprange = "Athletes";
			} else if (results.bfp > 13 && results.bfp <= 17) {
				results.bfprange = "Fitness";
			} else if (results.bfp > 17 && results.bfp <= 25) {
				results.bfprange = "Average";
			} else if (results.bfp > 25) {
				results.bfprange = "Obese";
			}
			break;

		case "female":
			if (results.bfp >= 10 && results.bfp <= 13) {
				results.bfprange = "Essential Fat";
			} else if (results.bfp > 13 && results.bfp <= 20) {
				results.bfprange = "Athletes";
			} else if (results.bfp > 20 && results.bfp <= 24) {
				results.bfprange = "Fitness";
			} else if (results.bfp > 24 && results.bfp <= 31) {
				results.bfprange = "Average";
			} else if (results.bfp > 32) {
				results.bfprange = "Obese";
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Kilograms</span>`;
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Pounds</span>`;
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Kilograms</span>`;
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Pounds</span>`;
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Kilograms</span>`;
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
			document.getElementById("lbm").innerHTML = `${results.lbm}<span style='font-size: 18px; color: white'> Pounds</span>`;
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
	document.getElementById("tbw").innerHTML = `${results.tbw}<span style='font-size: 18px; color: white'> Litres</span>`;
};

topage1 = _ => {
	$("#page1").fadeIn(250).css("display", "block");
	$("#profile").fadeIn(250).css("display", "block");
	$("#welcomePage").fadeOut(250).css("display", "none");
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
	if (document.getElementById("page1").style.display === "block") {
		$("#welcomePage").fadeIn(250).css("display", "block");
		$("#page1").fadeOut(250).css("display", "none");
		$("#profile").fadeOut(250).css("display", "none");
	} else if (document.getElementById("page2").style.display === "block") {
		$("#page1").fadeIn(250).css("display", "block");
		$("#page2").fadeOut(250).css("display", "none");
	} else if (document.getElementById("page3").style.display === "block") {
		$("#page2").fadeIn(250).css("display", "block");
		$("#page3").fadeOut(250).css("display", "none");
	}
};

// restart = _ => {
// 	$("#welcomePage").fadeIn(250).css("display", "block");
// 	$("#page4").fadeOut(250).css("display", "none");
// 	document.getElementById("arrow").style.left = -7 + "px";
// 	document.getElementById("Boer").selected = true;
// 	document.getElementById("borca").selected = true;
// 	document.getElementById("harris").selected = true;
// };

metricSystem = _ => {
	document.getElementById("weight").placeholder = "Your Weight In Kilograms";
	document.getElementById("height").placeholder = "Your Height In Centimeters";
	document.getElementById("neck").placeholder = "Your Neck Size In Centimeters";
	document.getElementById("waist").placeholder = "Your Waist Size In Centimeters";
	document.getElementById("hip").placeholder = "Your Hip Size In Centimeters";
};

imperialSystem = _ => {
	document.getElementById("weight").placeholder = "Your Weight In Pounds";
	document.getElementById("height").placeholder = "Your Height In Inches";
	document.getElementById("neck").placeholder = "Your Neck Size In Inches";
	document.getElementById("waist").placeholder = "Your Waist Size In Inches";
	document.getElementById("hip").placeholder = "Your Hip Size In Inches";
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