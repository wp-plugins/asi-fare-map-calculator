/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//var taxi_type;
var h1=window.location.pathname;
var base_url= window.location.origin+h1; 
base_url=base_url.replace('/wp-admin/admin.php','');
var stops_count = 0;
var baby_count = 0;
var markerBounds = new google.maps.LatLngBounds();
var geocoder = new google.maps.Geocoder();
var markers = new Array();
var directionsDisplay;
var directionsService;
var map;
var lats = '';
var lngs = '';
var taxi = base_url+"wp-content/plugins/asi-fare-map-calculator/img/passenger.png";
var home = base_url+"wp-content/plugins/asi-fare-map-calculator/img/home.png";
count_markers = 0;
var waypoints = new Array();
var first_time = true;
jQuery(document).ready(function()
{
  
    jQuery("#map_canvas").hide();
    map = new google.maps.Map(document.getElementById('map_canvas'),
            {center: new google.maps.LatLng(40.7141667, -74.0063889), zoom: 10});
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});
    
    // code for google auto suggestion address for pick up location
    var input = document.getElementById('source');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    // code for Google auto suggestion address for destination location
    var drop = document.getElementById('destination');
    var drop_autocomplete = new google.maps.places.Autocomplete(drop);
     autocomplete.bindTo('bounds', map);
  
});

function doCalculation()
{

    var cartypes=document.getElementById('cartypes').value;
    var address = document.getElementById('source').value;
    var destination = document.getElementById('destination').value;
    if(cartypes.trim()=='')
    {
        alert("Please Select Car Type. if Cartype is empty, then you need to inser first from admin side.");
        return false;
    }
    if(address.trim() == '') {
        alert("Please Enter Pickup Address");
        source = '';
        return false;
    }
    if(destination.trim() == '') {
        alert("Please Enter Drop Off Address");
        destination = '';
        return false;
    }
    if (first_time)
     {
         jQuery("#map_canvas").show(600);
         setTimeout(sourceAddress, 800);
         first_time = false;
     } else {
         sourceAddress();
     }


}
function sourceAddress() {
    clear();
   jQuery("#map_canvas").show(800);
    waypoints = new Array();
    
    var address = document.getElementById('source').value;
    var destination = document.getElementById('destination').value;

    geocoder.geocode({'address': address}, function(results, status) {
        console.log(results);
        if (status == google.maps.GeocoderStatus.OK) {
            var lat = document.getElementById("latitude").value = results[0].geometry.location.lat();
            var lng = document.getElementById("longitude").value = results[0].geometry.location.lng();
            var lng = document.getElementById("dest_latitude").value = results[0].geometry.location.lng();
            var lng = document.getElementById("dest_longitude").value = results[0].geometry.location.lng();

            var marker = new google.maps.Marker({
                map: map,
                icon: home,
                position: results[0].geometry.location
            });
            markers[count_markers++] = marker;
            destinationAddress();
        }
        else {
            alert('Result was not successful for the following reason: ' + status);
        }
    });
}


function destinationAddress() {

    var source = document.getElementById("source").value;
    var address = document.getElementById('destination').value;

    var request = {
        origin: source,
        destination: address,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });

    geocoder.geocode({'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat = document.getElementById("dest_latitude").value = results[0].geometry.location.lat();
            var lng = document.getElementById("dest_longitude").value = results[0].geometry.location.lng();

            var marker = new google.maps.Marker({
                map: map,
                icon: taxi,
                position: results[0].geometry.location
            });
            markers[count_markers] = marker;
            var picLatLng = new google.maps.LatLng(jQuery('#latitude').val(), jQuery('#longitude').val());
            var dropLatLng = new google.maps.LatLng(jQuery('#dest_latitude').val(), jQuery('#dest_longitude').val());
            markerBounds.extend(picLatLng);
            markerBounds.extend(dropLatLng);
            map.fitBounds(markerBounds);

            calc();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }

    });

}

function clear() {
    map = new google.maps.Map(document.getElementById('map_canvas'),
            {center: new google.maps.LatLng(40.7141667, -74.0063889), zoom: 10});
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});

    // code for google auto suggestion address for pick up location
    var input = document.getElementById('source');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    // code for Google auto suggestion address for destination location
    var drop = document.getElementById('destination');
    var drop_autocomplete = new google.maps.places.Autocomplete(drop);
    drop_autocomplete.bindTo('bounds', map);


}

function calc() {
    var source = document.getElementById("source").value;
    var stops_counts = document.getElementById("stops_count").value;
    var destination = document.getElementById("destination").value;
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
            {
                origins: [source],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false
            }, callback);

    function callback(response, status) {
        console.log(status);
        if (status == google.maps.DistanceMatrixStatus.OK) {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;

            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    if (element.status == "NOT_FOUND") {
                        document.getElementById("source").value = '';
                        alert("Please enter valid pickup address.");
                        return 0;
                    }
                    if (element.status == "ZERO_RESULTS") {
                        document.getElementById("destination").value = '';
                        document.getElementById("source").value = '';
                        alert("Please enter valid addresses.");
                        return 0;
                    }
                    var distance = element.distance.text;
                    var duration = element.duration.text;
                    console.log("dist:: " + distance + "\n dura:: " + duration);
                    document.getElementById("duration").value = duration;
                    document.getElementById("distance").value = distance;

                    var m_distance = 0.00, mile_distance = 0.00, ft_distance = 0.00, km_distance = 0.00, estimated_fare;
                    var distance_array = distance.split(" ");

                    distance_array[0] = distance_array[0].replace(/\,/g, ''); // 1125, but a string, so convert it to number
                    distance_array[0] = parseFloat(distance_array[0]);
                    if (distance_array[1] == 'm') {
                        m_distance = distance_array[0] / 1000;
                        mile_distance = parseFloat(m_distance) / 1.6;
                    } else if (distance_array[1] == 'ft') {
                        ft_distance = distance_array[0];
                        mile_distance = parseFloat(ft_distance) / 5280;
                    } else if (distance_array[1] == 'km') {
                        km_distance = parseFloat(distance_array[0]);
                        mile_distance = parseFloat(km_distance) / 1.6;
                    } else if (distance_array[1] == 'mi') {
                        mile_distance = distance_array[0];
                    }
                    dur_mins = 0;
                    var dur_array = duration.split(" ");
                    if (dur_array.length == 2) {
                        if (dur_array[1] == "mins") {
                            dur_mins = dur_array[0];
                        } else if (dur_array[1] == "hours" || dur_array[1] == "hour") {
                            dur_mins = parseFloat(dur_array[0]) * 60;
                        }
                    } else if (dur_array.length == 4) {
                        dur_mins = parseFloat(dur_array[2]);
                        dur_mins = dur_mins + parseFloat(dur_array[0]) * 60;
                    }
                    console.log("miles: " + mile_distance);
                    console.log("mins: " + dur_mins);

                    var stops_count = document.getElementById("stops_count").value;
                    var minutefare =document.getElementById('minutefare').value;
                    var stopfare=document.getElementById('stopfare').value;
                    var milefare=document.getElementById('milefare').value;
                    var seatfare=document.getElementById('seatfare').value;
                    var cartype=document.getElementById('cartypes').value;
                    var curr=document.getElementById('currfare').value;
                    var cartype=parseInt(cartype);
                    if (document.getElementById("baby_seat")) {
                        baby_count = parseFloat(document.getElementById("baby_count").value);
                    }
                   /*
                     if (taxi_type_s == true) {
                                            estimated_fare = cartype + (mile_distance * milefare) + (dur_mins * minutefare) + (baby_count * seatfare) + (stops_count * stopfare);
                                            estimated_fare = '$' + estimated_fare.toFixed(2);
                                        } else {
                    */
                        estimated_fare = cartype  + (mile_distance * milefare) + (dur_mins * minutefare) + (baby_count * seatfare) + (stops_count * stopfare);
                        estimated_fare = curr + estimated_fare.toFixed(2);
                    //}

                    if (mile_distance < .2) {
                        mile_distance = mile_distance * 5280;
                        mile_distance = mile_distance.toFixed(2) + ' Feet';
                    } else {
                        // estimated_fare
                        mile_distance = mile_distance.toFixed(2) + ' Miles';
                    }
                    document.getElementById("distance").value = mile_distance;
                    document.getElementById("fare").value = estimated_fare;
                    document.getElementById("duration").value = duration;

                    dsp();

                    document.getElementById("po").innerHTML = "<span class='nearest'> Estimated Fare : " + jQuery("#fare").val() + "</span><br>";
                    jQuery("#po").append("<span class='nearest'>Distance :" + jQuery("#distance").val() + "</span><br>");
                    jQuery("#po").append("<span class='nearest'>Duration :" + jQuery("#duration").val() + "</span><br>");

                }
            }
        }
    }
}

function dsp() {
    if (jQuery("#po").is(":hidden")) {
    }
    else {
        jQuery("#po").hide();
    }
    jQuery("#po").slideDown("slow", function() {
    });
}


function set_baby() {
    var baby = document.getElementById("baby_seat");
    //if(baby.checked){
    //    document.getElementById("baby_count").value=1; 
    //}
    //else{
    //   document.getElementById("baby_count").value=''; 
    //}
}

var s = "";
var count = 0;
var id = 0;

function clear_form_elements(ele) {
    count=0;
    first_time = true;
    jQuery("#po").html("");
    jQuery("#po").css("display","none");
    jQuery("#map_canvas").hide();

    tags = ele.getElementsByTagName('input');
    for (i = 0; i < tags.length; i++) {
        switch (tags[i].type) {
            case 'password':
            case 'text':
                tags[i].value = '';
                break;
            case 'checkbox':
            case 'radio':
                tags[i].checked = false;
                break;
        }
    }
    document.getElementById("baby_count").value = 0;
    document.getElementById("stops_div").value = "";
    document.getElementById("stops_count").value = 0;


}
jQuery(document).on('click','.rem',function(){
   var id = jQuery(this).attr('content');
    //............
    var h1=window.location.pathname;
    var base_url= window.location.origin+h1; 
    base_url=base_url.replace('/wp-admin/admin.php','');
 jQuery.post(base_url+'/wp-admin/admin-ajax.php', {action: 'asi_map_deletecar', id:id},function(data){
    //alert(data);
    	         }); 
});

function addcartype()
{
    alert('Please Do not wrtie currency symbol it already hase been written'); return false;
}