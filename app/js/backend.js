// GLOBAL VARIABLES

var apiUrl = "https://covidapi.info/api/v1/";
var _countries = "_countries";
var _country = "_country";

// GLOBAL WORLD DATA

var getGlobalData = function(container) {
    $.ajax({
        url: apiUrl + "global",
        type: "GET",
        cache: false
    }).done(function(result) {
        var confirmed = formatNumber(result.result.confirmed);
        var deaths = formatNumber(result.result.deaths);
        var recovered = formatNumber(result.result.recovered);

        var information = "<li class='table-row'><span>GLOBAL</span><span>" + confirmed + "</span><span>" + deaths + "</span><span>" + recovered + "</span></li>";

        container.append(information);
    });
}

// TOTAL COUNTY DATA

var getCountyData = function(container, counties = ["TUR"]) {
    $.each(counties, function(index, country) {
        $.ajax({
            url: apiUrl + "country/" + country + "/latest",
            type: "GET",
            cache: false
        }).done(function(result) {
            var date = Object.keys(result.result)[0];
            var countryData = result.result[date]

            var confirmed = formatNumber(countryData.confirmed);
            var deaths = formatNumber(countryData.deaths);
            var recovered = formatNumber(countryData.recovered);

            var information = "<li class='table-row'><span>" + findCountryNameFromCode(country) + "</span><span>" + confirmed + "</span><span>" + deaths + "</span><span>" + recovered + "</span></li>";

            container.append(information);
        });
    })
}

// LAST COUNTRY DATA

var getLast10Days = function(container, country = "TUR") {
    $.ajax({
        url: apiUrl + "country/" + country,
        type: "GET",
        cache: false
    }).done(function(result) {
        var dates = Object.keys(result.result);
        dates.reverse();
        dates = dates.slice(0, 10);

        $.each(dates, function(index, date) {
            var countryData = result.result[date]
            var confirmed = formatNumber(countryData.confirmed);
            var deaths = formatNumber(countryData.deaths);
            var recovered = formatNumber(countryData.recovered);
            var information = "<li class='table-row'><span>" + changeDate(date) + "</span><span>" + confirmed + "</span><span>" + deaths + "</span><span>" + recovered + "</span></li>";

            container.append(information);
        })

    });
}

// LOAD COUNTIES

var loadCountriesForMultipleSelection = function(container) {
    $.each(countryList, function(index, country) {
        chrome.storage.sync.get(_countries, function(data) {
            if (!data[_countries]) data[_countries] = ["TUR"];
            if (data[_countries].includes(country["alpha-3"])) {
                container.append("<option value='" + country["alpha-3"] + "' selected>" + country.name + "</option>");
            } else {
                container.append("<option value='" + country["alpha-3"] + "'>" + country.name + "</option>");
            }
        });
    })
}

var loadCountriesForSingleSelection = function(container) {
    $.each(countryList, function(index, country) {
        chrome.storage.sync.get(_country, function(data) {
            if (data[_country] == country["alpha-3"]) {
                container.append("<option value='" + country["alpha-3"] + "' selected>" + country.name + "</option>");
            } else {
                container.append("<option value='" + country["alpha-3"] + "'>" + country.name + "</option>");
            }
        });
    })
}

// FUNCTIONS

var changeDate = function(date) {
    _date = date.split("-")
    return _date[2] + "." + _date[1] + "." + _date[0];
}

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function findCountryNameFromCode(countryCode) {
    _result = "test"
    countryList.forEach(country => {
        if (country["alpha-3"] == countryCode) {
            _result = country["name"]
        }
    });
    return _result;
}

// MAIN

document.addEventListener('DOMContentLoaded', function() {

    // LOAD COUNTIES

    var multipleCountriesContainer = $("#countries");
    var singleCountriesContainer = $("#country");
    loadCountriesForMultipleSelection(multipleCountriesContainer);
    loadCountriesForSingleSelection(singleCountriesContainer);

    multipleCountriesContainer.select2({
        width: "100%",
        dropdownCssClass: "_select-dropdown",
        containerCssClass: "_select-container"
    });

    singleCountriesContainer.select2({
        width: "100%",
        dropdownCssClass: "_select-dropdown",
        containerCssClass: "_select-container"
    });

    // GLOBAL WORLD DATA
    var generalContainer = $("#general-info");
    getGlobalData(generalContainer);

    // TOTAL COUNTY DATA

    chrome.storage.sync.get(_countries, function(data) {
        _ctr = ["TUR"];
        if (data[_countries]) _ctr = data[_countries];
        getCountyData(generalContainer, _ctr);
    });

    multipleCountriesContainer.change(function() {
        var selectedCountry = multipleCountriesContainer.val();
        chrome.storage.sync.set({ _countries: selectedCountry });

        $("#general-info .table-row").remove();
        getGlobalData(generalContainer);
        getCountyData(generalContainer, selectedCountry);
    });

    // LAST COUNTRY DATA
    var lastContainer = $("#last-info");

    chrome.storage.sync.get(_country, function(data) {
        _ctr = "TUR";
        if (data[_country]) _ctr = data[_country];
        getLast10Days(lastContainer, _ctr);
    });

    singleCountriesContainer.change(function() {
        var selectedCountry = singleCountriesContainer.val();
        chrome.storage.sync.set({ _country: selectedCountry });

        $("#last-info .table-row").remove();
        getLast10Days(lastContainer, selectedCountry);
    });

}, false);