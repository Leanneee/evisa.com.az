Date.prototype.addDays = function(days) {
	let date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

String.prototype.supplant = function(o) {
	return this.replace(/{([^{}]*)}/g, function(a, b) {
		let r = o[b];
		return typeof r === 'string' || typeof r === 'number' ? r : a;
	});
};

const pageId = $('.page-identifier').attr('id');
const csrfToken = $('#csrf').val() || null;
var FIRST_INIT = true;

//const csrfEl = $('#csrf') || null;

const jsLibraries = {
	moment: '/public/js/helpers/moment.js',
	daterangepicker: '/public/js/helpers/daterangepicker.js',
	parsley:
		'https://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.8.1/parsley.min.js',
	bootstrap:
		'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
	captcha:
		'https://www.google.com/recaptcha/api.js?onload=initRecaptcha&render=explicit',
	slick: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js',
	list: '/public/js/helpers/list.min.js'
};

const cssLibraries = {
	daterangepicker: '/public/css/daterangepicker.css',
	slick: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css'
};

const dependencies = {
	home: [
		{
			js: ['slick'],
			css: ['slick'],
			fn: HomeSliderFn
		},
		{
			js: ['list'],
			fn: HomeListFn
		},
		{
			js: ['bootstrap'],
			fn: tooltipInit
		}
	],
	apply: [
		{
			js: ['moment', 'daterangepicker'],
			css: ['daterangepicker'],
			fn: ApplyDatepickerFn
		},
		{
			js: ['parsley'],
			fn: ApplyValidatorFn
		},
		{
			js: ['bootstrap', 'captcha'],
			fn: tooltipInit
		}
	],
	payLater: [
		{
			js: ['bootstrap']
		}
	],
	faq: [
		{
			js: ['list'],
			fn: FaqListFn
		}
	],
	country: [
		{
			js: ['list'],
			fn: HomeListFn
		}
	],
	slug: function() {
		return [...this.apply, { js: ['slick'], css: ['slick'], fn: HomeSlugFn }];
	}
};

function FaqListFn() {
	new List('faqList', {
		valueNames: ['faqItem']
	});
}

function HomeSlugFn() {
	$(document).ready(function() {
		$('.slider-wrap').slick({
			dots: false,
			arrows: false,
			infinite: true,
			draggable: false,
			autoplay: true,
			speed: 500,
			fade: true,
			cssEase: 'linear'
		});
		HomeSliderFn(2);
	});
}

function HomeListFn() {
	new List('countriesList', {
		valueNames: ['countryName']
	});
}

function showPaymentWindow() {
	// $('.spinner-large').html('').html(iframeHtml);
	$('.full-page-loading').slideDown();
}

function onGoingSubmit() {
	return new Promise(function(resolve, reject) {
		if (grecaptcha === undefined) {
			alert('Recaptcha not defined');
			reject();
		}

		if (!grecaptcha.getResponse()) {
			alert('Could not get recaptcha response');
			reject();
		}

		$(document)
			.find('form')[0]
			.submit();
	});
}

function tooltipInit() {
	if (!detectMobile()) {
		$('[data-toggle="tooltip"]').tooltip();
	}
}

function HomeSliderFn(count = 3) {
	$('.slider_items').slick({
		infinite: true,
		speed: 300,
		slidesToShow: count,
		autoplay: true,
		slidesToScroll: count,
		adaptiveHeight: true,
		arrows: true,
		prevArrow:
			'<button type=\'button\' class=\'slick-prev slick_prev slick-arrow\'><i class=\'fa fa-chevron-left\'></i></button>',
		nextArrow:
			'<button type=\'button\' class=\'slick-next slick_next slick-arrow\'><i class=\'fa fa-chevron-right\'></i></button>',
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					autoplay: true,
					slidesToShow: 2,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 480,
				settings: {
					autoplay: true,
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});

	$('.carousel').slick({
		fade: true,
		autoplay: true,
		prevArrow:
			'<button type=\'button\' class=\'carousel-prev hidden-xs\'><i class=\'fa fa-chevron-left\'></i></button>',
		nextArrow:
			'<button type=\'button\' class=\'carousel-next hidden-xs\'><i class=\'fa fa-chevron-right\'></i></button>'
	});
}

const getCollapseBody = id => {
	return $(id)
		.parents('.collapse-parent')
		.find('.collapse_content');
};

$('.collapse_core').on('click', function() {
	let currentBody = getCollapseBody($(this)),
		currentId = currentBody.attr('data-id');

	currentBody.is(':visible')
		? closeCollapse(currentBody, $(this))
		: showCollapse(currentBody, $(this));

	$('.home-collapse-wrap')
		.find('.collapse_core')
		.each(function() {
			let itemBody = getCollapseBody($(this)),
				itemId = itemBody.attr('data-id');

			if (itemId !== currentId) {
				closeCollapse(itemBody, $(this));
			}
		});
});

const closeCollapse = (itemBody, item) => {
	item.removeClass('collapse_active');
	itemBody.slideUp();
};

const showCollapse = (itemBody, item) => {
	item.addClass('collapse_active');
	itemBody.slideDown();
};

function ajaxGet(url) {
	return $.ajax({
		url: url,
		type: 'GET',
		datatype: 'json'
	});
}

$('#getMoreTestimonials').on('click', function() {
	const initBtn = $('#getMoreTestimonials');
	let start = parseInt(initBtn.attr('data-start'));
	ajaxGet(`/testimonials/comment_load/${start}`).then(result => {
		if (result.length > 0) {
			initBtn.attr('data-start', start + 1);
			result = JSON.parse(result);
			const reviewHTML = $('#reviewItem');
			let html = '';
			for (const iterator of result) {
				let reviewHTMLClone = reviewHTML.clone();
				html += reviewHTMLClone.html().supplant(iterator);
			}
			$('.comments_load_area').append(html);
		}
	});
});

function ajaxPost(url, data, beforeSendFn = null) {
	return $.ajax({
		url: url,
		type: 'POST',
		beforeSend: beforeSendFn,
		datatype: 'json',
		data: {
			evisa_csrf_token: csrfToken,
			body: data
		}
	});
}

function submitLoaderToggler() {
	$('.full-page-loading').slideToggle();
}

const scrollToElement = (el, distance = 35) => {
	$('html, body').animate(
		{
			scrollTop: el.first().offset().top - distance
		},
		1500
	);
};

const loadJsFormatter = (sources, list, key) => {
	if (typeof list[key] !== 'undefined') {
		for (let i of list[key]) {
			let src = key === 'js' ? jsLibraries[i] : 'css!' + cssLibraries[i];
			sources.push(src);
		}
	}
	return sources;
};

const dependencySrcBuilder = devs => {
	let sources = [];
	loadJsFormatter(sources, devs, 'js');
	loadJsFormatter(sources, devs, 'css');
	return sources;
};

if (typeof dependencies[pageId] !== 'undefined') {
	let dependecyList =
		typeof dependencies[pageId] === 'function'
			? dependencies[pageId]()
			: dependencies[pageId];
	if (typeof dependecyList !== 'undefined') {
		for (let devs of dependecyList) {
			loadjs(dependencySrcBuilder(devs), {
				async: false,
				success: function() {
					if (devs.fn) devs.fn();
				}
			});
		}
	}
}

/**
 * APPLY PROCESS
 */

const APPLICATIONS = {};
const TOTAL_COST = {};
let COUNTER = 1;
let newPersonFlag = false;
let DISALLOWED_VISA_TYPES = null;
let SERIALIZED_FORM_DATA = null;

//MM(-1)-DD-YYY
const holidayDaysStandartVisa = [];
const holidayDaysUrgentVisa = [];

if(typeof urgentHolidayDays !== 'undefined' && urgentHolidayDays != null) {
	for(let o of urgentHolidayDays) {
		let dateObj = new Date(o * 1000);
		let dateStr  = dateObj.getMonth()+'-'+dateObj.getDate()+'-'+dateObj.getFullYear();
		holidayDaysUrgentVisa.push(dateStr);
	}
}

if(typeof standardHolidayDays !== 'undefined' && standardHolidayDays != null) {
	for(let o of standardHolidayDays) {
		let dateObj = new Date(o * 1000);
		let dateStr  = dateObj.getMonth()+'-'+dateObj.getDate()+'-'+dateObj.getFullYear();
		holidayDaysStandartVisa.push(dateStr);
	}
}


const timezoneNormalization = date => {
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - 480);
	date.setHours(date.getHours() + 12);
	return date;
};

const isNotHoliday = (date, type) => {
	let list =
		type === 'standart' ? holidayDaysStandartVisa : holidayDaysUrgentVisa;

	let dateStr =
		date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear();

	return list.indexOf(dateStr) < 0;
};


const isWorkingHour = (date, type, t = 0) => {
	let flag = false;
	//let day = date.getDay();
	let hour = date.getHours();

	if (!isNotHoliday(date, type)) {
		return false;
	}


	if(hour < 18 && t === 0) {
		flag = true;
	}
	
	if(hour < 18 && hour > 8 && t === 1) {
		flag = true;
	}

	return flag;
};

const daysToNearestWorkingDay = (date, type) => {
	let realdays = 0;
	
	while (!isWorkingHour(date, type)) {
		
		realdays++;
		date.setHours(9);
		date.setDate(date.getDate() + 1);
		if (realdays > 25) {
			break;
		}
	}
	return realdays;
};

const daysForProcessing = date => {
	let counter = 0;
	let realdays = 0;
	while (counter < 3) {
		realdays++;
		date.setDate(date.getDate() + 1);
		if (date.getDay() % 6 && isNotHoliday(date, 'standart')) {
			counter++;
		}
	}
	return realdays;
};

const calculateStandartVisa = () => {
	let today = timezoneNormalization(new Date()),
		applyDate = timezoneNormalization(new Date()),
		arrivalDate = timezoneNormalization(new Date());

	let daysToApply = daysToNearestWorkingDay(today, 'standart');

	applyDate.setDate(applyDate.getDate() + daysToApply);
	let processingDays = daysForProcessing(applyDate);

	let totalRealdays = daysToApply + processingDays + 1;

	arrivalDate.setDate(arrivalDate.getDate() + totalRealdays);

	return arrivalDate;
};

const calculateUrgentVisa = () => {
	let today = timezoneNormalization(new Date()),
		arrivalDate = timezoneNormalization(new Date());
	
	let daysToApply = daysToNearestWorkingDay(today, 'urgent');
	arrivalDate.setDate(arrivalDate.getDate() + daysToApply);
	return arrivalDate;
};

const printVisaEntryExitDates = entryDate => {
	let endDate = entryDate.addDays(90);
	printPassportExpiryDate();


	$('.js-start-full-date').text(moment(entryDate).format('DD.MM.YYYY'));
	$('.js-end-full-date').text(moment(endDate).format('DD.MM.YYYY'));

	let dates = {
		startDay: entryDate.getDate(),
		startMonth: getMonthTextFromDate(entryDate),
		startYear: entryDate.getFullYear(),
		endDay: endDate.getDate(),
		endMonth: getMonthTextFromDate(endDate),
		endYear: endDate.getFullYear()
	};

	for (const key of Object.keys(dates)) {
		$(`.js-${key}`).text(dates[key]);
	}
};

const getMonthTextFromDate = (date, format = 'long') => {
	return date.toLocaleString('en-us', { month: format });
};

const printArrivalDate = () => {
	let disabled = false;
	let arrivalDate;

	if ($('input[name="processing_type"]:checked').val() == 2) {
		disabled = true;
		arrivalDate = calculateUrgentVisa();
	} else {
		arrivalDate = calculateStandartVisa();
	}

	const elArrivalDate = $('.js-arrival-date');

	elArrivalDate.attr('disabled', disabled);

	elArrivalDate.daterangepicker({
		singleDatePicker: true,
		minDate: arrivalDate,
		startDate: arrivalDate,
		maxDate: new Date().addDays(180),
		showDropdowns: true,
		locale: {
			format: 'DD MMMM YYYY'
		}
	});

	elArrivalDate.val(moment(arrivalDate).format('DD MMMM YYYY'));

	printVisaEntryExitDates(arrivalDate);
	
	elArrivalDate.on('change', function() {
		FIRST_INIT = false;
		printVisaEntryExitDates(new Date($(this).val()));
	});
};

const initalFormValidation = () => {
	const imValidate = ['js-travel-document', 'js-arrival-date'];

	if (
		$('.js-customer-country')
			.find(':selected')
			.val().length > 0
	) {
		imValidate.push('js-customer-country');
	}

	if ($('input[name="processing_type"]:checked').length > 0) {
		imValidate.push('js-processing-type-v');
	}

	for (const iterator of imValidate) {
		$(`.${iterator}`)
			.parsley()
			.validate();
	}
};

const resetApplicationForm = formId => {
	document.getElementById(formId).reset();
	let formEl = $(`#${formId}`);
	formEl.find('.custom-checkboxes').each(function() {
		$(this)
			.find('label')
			.removeClass('active validation validation-fail validation-success');
	});
	$('.upload_button').removeAttr('disabled');
	$('.imgBody').remove();
	$('#js-karabakh_visit_reason').slideUp();
	formEl.parsley().reset();
};

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const applicationDataFormatter = (key, value) => {
	let result = value;
	switch (key) {
	case 'travel_document':
		result = capitalize(value);
		break;
	case 'uploadedPassportURI':
		result =
				getFileExtensionFromString(value) === 'pdf'
					? `<a target="_blank" class="pdfFileIcon" href='/uploads/${value}'><i class="fa fa-file-pdf-o"></i></a>`
					: `<img src='${value}' width=100>`;
		break;
	case 'country_of_birth':
		result = $('select[name="country_of_birth"]')
			.find(':selected')
			.text();
		break;
	case 'purpose_of_visit':
		result = $('.js-purpose-of-visit')
			.find(':selected')
			.text();
		break;
	case 'occupation':
		result = $('select[name="occupation"]')
			.find(':selected')
			.text();
		break;
	case 'visited_karabakh':
		result = value == 2 ? 'No' : 'Yes';
		break;
	}

	return result;
};

const getFileExtensionFromString = str => str.substr(str.lastIndexOf('.') + 1);


const getTextOfSelectByValue = (selectName, value) => {
	return $(`select[name="${selectName}"]`)
		.find(`[value='${value}']`)
		.text()
		.trim();
};

const validateAndAct = (callback, type = 0) => {
	let validationResult = $('#application_form')
		.parsley()
		.validate();

	if (validationResult) {
		SERIALIZED_FORM_DATA = $('#application_form').serializeArray();
		callback(SERIALIZED_FORM_DATA);
	} else {
		if (type === 1) {
			printApplicantsSpan();
			$('#cancel-new-person').modal();
		} else if (type === 2) {
			callback();
		} else {
			scrollToElement($('.validation-fail'));
		}
	}
};

$('.js-customer-country').on('change', function () {
	let el = $(this).find(":selected").attr('disallowed');
	DISALLOWED_VISA_TYPES = (el.length > 1) ? el.split('; ') : null;
	$('.js-travel-document').parsley().validate();
});

const calcCurrentCost = () => {
	let visaPrice = 0,
		riskPrice = 0,
		customerCountry = $('.js-customer-country'),
		processingType = $('input[name="processing_type"]:checked');

	if (
		customerCountry.parsley().isValid() &&
		$('.js-travel-document')
			.parsley()
			.isValid() &&
		processingType.parsley().isValid()
	) {
		riskPrice = parseFloat(
			customerCountry.find(':selected').attr('risk_price_usd')
		);

		visaPrice =
			parseFloat(processingType.attr('visa-fee-usd')) +
			parseFloat(processingType.attr('service-fee-usd'));
	}

	return visaPrice + riskPrice;
};

const calcSavedApplicationsCost = () => {
	if (!noSavedApplications()) {
		return Object.values(TOTAL_COST).reduce((a, b) => a + b);
	}
	return 0;
};

//const calcTotalCost = () => calcCurrentCost() + calcSavedApplicationsCost();

const addNewPersonCallback = formInputs => {
	const elementsList = [
		'travel_document',
		'purpose_of_visit',
		'arrival_date',
		'lastname',
		'other_name',
		'country_of_birth',
		'occupation',
		'email',
		'contact_number',
		'residence_address',
		'passport_expiry',
		'uploadedPassportURI',
		'place_of_stay',
		'visited_karabakh',
		'karabakh_visit_reason'
	];

	let prefix = 'js-strp-';
	for (const iterator of formInputs) {
		if (elementsList.indexOf(iterator.name) >= 0) {
			$('#' + prefix + iterator.name).html(
				applicationDataFormatter(iterator.name, iterator.value)
			);
		}
	}

	$('#verifyInfo').modal('show');
};

const detectMobile = () => {
	if (
		navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i)
	) {
		return true;
	} else {
		return false;
	}
};

const totalCostHTMLToggles = amount => {
	if (detectMobile()) {
		amount = amount > 0 ? amount : $('#fullFeeValue').val();
	} else {
		amount > 0
			? $('.total-price-wrap').slideDown()
			: $('.total-price-wrap').slideUp();
	}

	$('.price-value').text(amount + '.00 $');
};

const verifyBasketElement = basketId =>
	typeof APPLICATIONS[basketId] === 'object' &&
	typeof TOTAL_COST[basketId] !== 'undefined';

const prepApplicationForm = () => {
	resetApplicationForm('application_form');
	printArrivalDate();
	initalFormValidation();
};

const numberOfApplicants = () => Object.keys(APPLICATIONS).length;

const printApplicantLabel = () => {
	let count = numberOfApplicants();
	if (count === 0) {
		$('.applicantCounter').fadeOut();
	} else {
		$('.applicantCounter')
			.fadeIn()
			.html(`<span>Applicant - #${count + 1}</span>`);
	}
};

const printApplicantsSpan = () => {
	let count = numberOfApplicants();
	$('.numberOfApplicantsSpan').each(function() {
		$(this).text(count + 1);
	});
};

const calcTotalCost = () => {
	const priceEl = $('#costInfo');

	let standardPrice = parseInt(priceEl.attr('data-standard')),
		urgentPrice = parseInt(priceEl.attr('data-urgent')),
		standard = 0,
		urgent = 0;

	for (const i of Object.keys(APPLICATIONS)) {
		APPLICATIONS[i]['processing_type'] == 1 ? standard++ : urgent++;
	}

	return {
		standardCount: standard,
		urgentCount: urgent,
		standardTotal: standard * standardPrice,
		urgentTotal: urgent * urgentPrice
	};
};

const printPriceTable = () => {
	let costDetails = calcTotalCost();

	if (costDetails.standardCount > 0) {
		$('.hasStandard').removeClass('hidden');
		$('.standardVisaCount').text(costDetails.standardCount);
		$('.standardVisaCost').text(costDetails.standardTotal + ' EUR');
	} else {
		$('.hasStandard').addClass('hidden');
	}

	if (costDetails.urgentCount > 0) {
		$('.hasUrgent').removeClass('hidden');
		$('.urgentVisaCount').text(costDetails.urgentCount);
		$('.urgentVisaCost').text(costDetails.urgentTotal + ' EUR');
	} else {
		$('.hasUrgent').addClass('hidden');
	}

	$('.totalVisaCount').text(
		costDetails.standardCount + costDetails.urgentCount
	);
	$('.totalVisaCost').text(
		costDetails.standardTotal + costDetails.urgentTotal + ' EUR'
	);
};

const noSavedApplications = () => Object.keys(APPLICATIONS).length === 0;

const savePersonData = () => {
	if (SERIALIZED_FORM_DATA != null) {
		TOTAL_COST[COUNTER] = calcCurrentCost();
		APPLICATIONS[COUNTER] = formatFormData(SERIALIZED_FORM_DATA);
		COUNTER++;
		SERIALIZED_FORM_DATA = null;
		$('#accordion').append(confirmationBodyGenerator());
	}
};

const showConfirmationStep = () => {
	location.hash = 'confirmation';
	const hideElements = [
		$('.informationNote'),
		$('#sticky-anchor'),
		$('.basket-body'),
		$('.contenT'),
		$('#btnOpenPaymentSummary')
	];
	for (const iterator of hideElements) {
		iterator.slideUp();
	}

	$('#step-1-circle')
		.attr('disabled', 'disabled')
		.toggleClass('btn-primary btn-default');
	// $('.js-continue').attr('data-step', '2').find('.btn__title').text(btnText);
	$('#confirmation-content-a').removeClass('hidden');
	$('#step-2-circle').toggleClass('btn-primary btn-default');
	$('#information').slideUp();
	
	//printPriceTable();
	$('#accordion').find('.panel').last().collapse();

	$('.informationNote2').removeClass('hidden');
	$('#confirmation').slideDown();

		//sss
	let showNotification = false;

	if(!isWorkingHour(timezoneNormalization(new Date()), 'urgent', 1)) {
		for (const key of Object.keys(APPLICATIONS)) {
			if (APPLICATIONS[key]['processing_type'] == 2) {
				showNotification = true;
				break;
			}
		}
	}

 
	if(showNotification)  {
		$('#after-workhours').modal();
	}

		

	scrollToElement($('#wizard'), 0);
};

const moveConfirmationStepCallback = () => {
	savePersonData();
	showConfirmationStep();
};

const formatFormData = formInputs => {
	let result = {};

	for (const iterator of formInputs) {
		result[iterator.name] = iterator.value;
	}

	return result;
};

const extendApplicationData = (applicationData, id) => {
	let clonedApplicationData = Object.assign({}, applicationData);

	const elements = [
		'country_of_birth',
		'customer_country',
		'occupation',
		'purpose_of_visit'

	];

	clonedApplicationData['key'] = id;
	clonedApplicationData['travel_document__formatted'] =
		capitalize(clonedApplicationData['travel_document']) + ' Passport';

	for (const iterator of elements) {
		clonedApplicationData[iterator + '__formatted'] = getTextOfSelectByValue(
			iterator,
			clonedApplicationData[iterator]
		);
	}

	let file = clonedApplicationData['uploadedPassportURI'];
	clonedApplicationData['passportFile_formatted'] =
		getFileExtensionFromString(file) === 'pdf'
			? `<a target="_blank" class="pdfFileIcon" href="${file}"><i class="fa fa-file-pdf-o"></i></a>`
			: `<img src="${file}" width='100' height="auto"></img>`;

	clonedApplicationData['processing_type__formatted'] = 
		(clonedApplicationData['processing_type'] == 2) ? 'Urgent' : 'Standard';

	return clonedApplicationData;
};

const confirmationBodyGenerator = () => {
	let html = '';
	const confirmationHTML = $('#confirmationItem');
	//for (const i of Object.keys(APPLICATIONS)) {
	let lastApplicant = Object.keys(APPLICATIONS).reduce((a, b) =>
		a > b ? a : b
	);

	let applicationData = extendApplicationData(
		APPLICATIONS[lastApplicant],
		lastApplicant
	);
	let confirmationHTMLClone = confirmationHTML.clone();

	html += confirmationHTMLClone.html().supplant(applicationData);
	//}
	return html;
};

function ApplyDatepickerFn() {
	location.hash = '';
	printArrivalDate();
}

function printPassportExpiryDate() {

	let arrivalDateVal = $('.js-arrival-date').val();
	let myDate = moment(arrivalDateVal, 'DD MMMM YYYY').toDate();

	const passportExpiryEl = $('.js-passport-expiry');

	if(FIRST_INIT === true) {
		passportExpiryEl.daterangepicker({
			singleDatePicker: true,
			autoUpdateInput: false,
			minDate: myDate.addDays(188),
			showDropdowns: true
		});
	}else{
		passportExpiryEl.data('daterangepicker').setMinDate(myDate.addDays(188));
		passportExpiryEl.val('');
		passportExpiryEl.parsley().reset();
	}
}

function ApplyValidatorFn() {
	let countryTypeId = 0;

	$('#application_form').parsley({
		trigger: 'change',
		focus: 'none',
		successClass: 'validation validation-success',
		errorClass: 'validation validation-fail',
		classHandler: function(el) {
			return el.$element.closest('.custom-input-wrap');
		},

		errorsContainer: function(parsleyField) {
			let element = parsleyField.$element;
			let fieldSet = element
				.closest('.js-custom-radio-wrap')
				.find('.js-radio-error-text-parent');

			if (element.hasClass('showErrorsBelow')) {
				fieldSet = element
					.parents('.hasActiveErrors')
					.find('.belowErrorsContainer');
			}

			if (fieldSet.length > 0) {
				return fieldSet;
			}

			return parsleyField;
		}
	});

	const countryErrorMessages = {
		1: 'Due to the absence of the selected country of nationality in the list of e-Visa eligible countries, issuing electronic visa is not possible. For more information, it is recommended to approach a consulate or an embassy the Republic of Azerbaijan.',
		3: 'You are exempt from visa for tourism purposes within 30 days starting from the first entry date. Requirements for visa exemption: Valid for touristic purposes not exceeding 30 days per entry.',
		4: 'Citizens of are not eligible to apply for e-Visa, since there is no any diplomatic relations between Republic of Azerbaijan and .'
	};
	countryErrorMessages[2] = countryErrorMessages[1];
	countryErrorMessages[5] = countryErrorMessages[1];

	window.Parsley.addValidator('country', {
		validateString: function() {
			let selectedCountry = $('.js-customer-country').find(':selected');
			countryTypeId = selectedCountry.attr('type');
			window.Parsley.addMessage(
				'en',
				'country',
				countryErrorMessages[countryTypeId]
			);
			return countryTypeId == 6;
		}
	});

	window.Parsley.addValidator('traveldoc', {
		validateString: function(value) {
			return DISALLOWED_VISA_TYPES && DISALLOWED_VISA_TYPES.indexOf(value) > -1
				? false
				: true;
		},
		messages: {
			en:
				'You are exempt from visa for tourism purposes within 30 days starting from the first entry date. Requirements for visa exemption: Valid for touristic purposes not exceeding 30 days per entry.'
		}
	});

	$('.js-customer-country')
		.parsley()
		.on('field:error', function(parsleyField) {
			let element = parsleyField.$element;
			let errorsContainer = element
				.parents('.hasActiveErrors')
				.find('.belowErrorsContainer');
			element.find(':selected').val() == ''
				? errorsContainer.addClass('hidden')
				: errorsContainer.removeClass('hidden');
		});

	$(window).on('load', function() {
		initalFormValidation();
	});
	//scrollToElement($('#wizard'), 0);
}

$('.js-passport-expiry').on('apply.daterangepicker', function(ev, picker) {
	$(this).val(picker.startDate.format('DD MMMM YYYY'));
	$(this)
		.parsley()
		.validate();
});

$(document).on('click', '.js-basket-remover', function() {
	let basketId = $(this).attr('data-id');
	if (verifyBasketElement(basketId)) {
		delete APPLICATIONS[basketId];
		delete TOTAL_COST[basketId];
		printApplicantLabel();
		$(`#basket-element-${basketId}`).remove();
		$(`#basket-panel-${basketId}`).remove();
		printPriceTable();
		if ($(this).hasClass('js-confirm-layer') && noSavedApplications()) {
			location.reload();
		}
	}
});

$('.js-keyup-change').on('keyup', function() {
	let type = $(this).attr('data-type');
	let info = $(this).val().length > 0 ? $(this).val() : capitalize(type);
	$('.basket-body')
		.children()
		.last('.basket-item')
		.find(`.${type}-box`)
		.text(info);
});

$('.js-processing-type').on('change', function() {
	printArrivalDate();
});

$('#editApplication').on('click', function() {
	$('#verifyInfo').modal('hide');
	scrollToElement($('#wizard'), 0);
});

$('.js-add-new-person').on('click', function(event) {
	event.preventDefault();
	validateAndAct(addNewPersonCallback);
});

$('#verifyApplication').on('click', function() {
	if (SERIALIZED_FORM_DATA != null) {
		newPersonFlag = true;
		savePersonData();
		$('#confirmation-content-a').removeClass('hidden');
		printApplicantLabel();

		prepApplicationForm();
		$('#verifyInfo').modal('hide');
		scrollToElement($('#wizard'), 0);
	}
});

function movePaymentStep(token) {
	if (token.length > 0) {
		let applicationsSubmit = {
			applications: APPLICATIONS,
			recaptcha: token
		};

		let payload = JSON.stringify(applicationsSubmit);

		ajaxPost('/apply/submit', payload, submitLoaderToggler).then(result => {
			if (result.status === true) {
				window.location.replace(result.message);
			} else {
				grecaptcha.reset();
				submitLoaderToggler();
				$('#errors-modal').modal('show');
				$('#ajaxErrorsList')
					.html('')
					.append(`<li>${result.errors}</li>`);
			}
		});
	} else {
		alert('Please select recaptcha');
	}
}

const initApplyRecaptcha = () => {
	grecaptcha.execute();
};

const responseMessage = ratingValue => {
	$('input[name="star"]').val(ratingValue);
};

$('a.js-continue').on('click', function(event) {
	event.preventDefault();

	let step = $(this).attr('data-step');
	let numberOfApplications = Object.keys(APPLICATIONS).length;

	if (step == 1) {
		numberOfApplications
			? applyStepContinueGate()
			: validateAndAct(moveConfirmationStepCallback);
	} else {
		numberOfApplications ? initApplyRecaptcha() : location.reload();
	}
});

const applyStepContinueGate = () => {
	if (newPersonFlag) {
		validateAndAct(moveConfirmationStepCallback, 1);
	} else {
		showConfirmationStep();
	}
};

$('#discardNewPerson').on('click', function() {
	$('#cancel-new-person').modal('hide');
	validateAndAct(moveConfirmationStepCallback, 2);
});

$('#fillPersonData').on('click', function() {
	$('#cancel-new-person').modal('hide');
	scrollToElement($('.validation-fail'));
});

function initRecaptcha() {
	grecaptcha.render('captchaPlace', {
		sitekey: '6LfqkHIUAAAAAKOFf9NGqxivg1Kf60cQ19zghzlZ',
		badge: 'inline',
		type: 'image',
		size: 'invisible',
		callback: movePaymentStep
	});
}



$('.custom-checkboxes')
	.find('.js-validate-radio')
	.on('change', function() {
		$(this)
			.parsley()
			.validate();
	});

$(document).on('click', '#deleteFile', function() {
	ajaxPost('/apply/remove_image', $('.imgBody').attr('data-src')).then(
		result => {
			if (result === 'success') {
				$('.imgBody').remove();
				$('#uploadedPassportURI')
					.val('')
					.trigger('change');
				$('.upload_button').removeAttr('disabled');
				$('#uploadPassportFile').val('');
			}
		}
	);
});



$('#uploadedPassportURI').on('change', function() {
	$(this)
		.parsley()
		.validate();
});

$('#uploadPassportFile').on('change', function() {
	if ($(this).length < 1) {
		return false;
	}
	$('#uploadPassport').modal('hide');

	let formData = new FormData();

	jQuery.each(jQuery('#uploadPassportFile')[0].files, function(i, file) {
		formData.append('passportFile', file);
	});
	formData.append('evisa_csrf_token', csrfToken);

	$.ajax({
		url: '/apply/upload',
		type: 'POST',
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
		beforeSend: function() {
			$('.loaderAnimation').show();
		},
		success: function(data) {
			$('.loaderAnimation').hide();
			if (data.type === 'success') {
				let linkHTML =
					data.ext === 'pdf'
						? `<a target="_blank" href='/uploads/${
							data.message
						  }'><i class="fa fa-file-pdf-o"></i></a>`
						: `<img src='/uploads/${data.message}'>`;

				let fullHTML = `<span class="imgBody" data-src='/uploads/${
					data.message
				}'>${linkHTML}<span id="deleteFile">&times;</span></span>`;

				$('#uploadedPassportWrap').append(fullHTML);
				$('#uploadedPassportURI')
					.val(`/uploads/${data.message}`)
					.trigger('change');
				$('.upload_button').attr('disabled', 'true');
			} else {
				$('#errors-modal').modal('show');
				$('#ajaxErrorsList').append(`<li><p>${data.message}</p></li>`);
			}
		}
	});
});

//const showErrorModal(error)

$('input[name="visited_karabakh"]').on('change', function() {
	const reasonInput = $('#js-karabakh_visit_reason');
	if ($(this).val() == 1) {
		reasonInput.fadeIn();
		$('input[name="karabakh_visit_reason"]').attr(
			'data-parsley-required',
			'true'
		);
	} else {
		reasonInput.fadeOut();
		$('input[name="karabakh_visit_reason"]').removeAttr(
			'data-parsley-required'
		);
	}
});

$('.js-read-toggler').on('click', function() {
	const readMoreBtn = $(this);
	let text = 'Read more';
	let status = 0;

	if (readMoreBtn.attr('data-status') == 0) {
		text = 'Read less';
		status = 1;
	}

	readMoreBtn.attr('data-status', status);
	readMoreBtn.text(text);
	readMoreBtn
		.parents('.seo-text-block')
		.find('.seo-text-element')
		.toggleClass('long-text-cut');
});

$('.hide-btn').on('click', function() {
	$('#sticky-anchor').toggleClass('open');
	$('#checkoutSummary').toggleClass('opened');
	$('._show_1e.wrap_mW').toggleClass('z-index-0');
});

const at_modal = $('#at_modal'),
	at_modal_conatiner = $('.modal-container'),
	at_modal_content = $('.modal-content'),
	at_modal_close = $('.modal-close');

at_modal.on('click', function() {
	at_modal_conatiner.addClass('at_modal_container_open');
	at_modal_content.css('background-color', 'black');
});

at_modal_close.on('click', function() {
	at_modal_conatiner.removeClass('at_modal_container_open');
});

window.onclick = function(e) {
	if (e.target == at_modal_conatiner) {
		at_modal_conatiner.removeClass('at_modal_container_open');
	}
};

$(document).ready(function() {
	$('#stars li')
		.on('mouseover', function() {
			let onStar = parseInt($(this).data('value'), 10);

			$(this)
				.parent()
				.children('li.star')
				.each(function(e) {
					e < onStar ? $(this).addClass('hover') : $(this).removeClass('hover');
				});
		})
		.on('mouseout', function() {
			$(this)
				.parent()
				.children('li.star')
				.each(function() {
					$(this).removeClass('hover');
				});
		});

	$('#stars li').on('click', function() {
		let onStar = parseInt($(this).data('value'), 10);
		let stars = $(this)
			.parent()
			.children('li.star');

		for (let i = 0; i < stars.length; i++) {
			$(stars[i]).removeClass('selected');
		}

		for (let i = 0; i < onStar; i++) {
			$(stars[i]).addClass('selected');
		}

		let ratingValue = parseInt(
			$('#stars li.selected')
				.last()
				.data('value'),
			10
		);
		responseMessage(ratingValue);
	});
});

$('.faq-element').on('click', function() {
	$(this).toggleClass('stack-up-open stack-down-open');
	let currentItem = $(this).attr('data-faq-item');
	$(`.faq-body-${currentItem}`).slideToggle();
});

$('#jivoChatInit').on('click', function() {
	jivo_api.open();
});

$('#js-check-country-requirements').on('click', function() {
	let country = $('#js-visaRequirementsSelect').val();
	if (country.length > 0) {
		window.location.href = `/apply/${country}`;
	}
});
