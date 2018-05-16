var lat="", lng="", current_loc=""; var flag=-1;
var tokens = [];
var flag = -1; var map =""; var directionsDisplay =""; var marker="";
var source = ""; var destination = "42.345573,-71.098326"; var key = "AIzaSyAFUA0nL7qpmZ3k5VP-Kczu9xKG7OD90EI"; var service = '', photo_flag = '', review_flag = ''; var page_no = 0, next_token='', isIPAPI='', review_flag_yelp='',is_keyword = '', is_loc = '', data_flag='', store_details = '',delete_flag='',clear_flag='';

$(document).on('keyup', '#from-address', function(e) { 
    if ($('#from-address').val()){
        $("#directions").prop("disabled",false);
    } else {
        $("#directions").prop("disabled",true);
    }
});

$(document).on('input', '#key', function(e) { 
    var input=$(this);
    var errmsg = document.getElementById("key");
    errmsg = errmsg.parentNode.children[1];
    if(input.val().replace(/\s/g, '').length || input.val()==""){
        input.removeClass("invalid").addClass("valid");
        errmsg.classList.remove("error_show");
        errmsg.style.display="none";
        if(input.val()!=""){
            is_keyword = true;
        }
        else{
            is_keyword = false;
        }
    }
    else{
        input.removeClass("valid").addClass("invalid");
        errmsg.classList.add("error_show");
        errmsg.style.display="block";
        is_keyword = false;
    }
    var radio = document.getElementsByName("gridRadios");
    var val="";
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            val = radio[i].value;
        }
    }
    if(val==="here"){
        is_loc = true;
    } 

    if(isIPAPI && is_keyword && is_loc){
        document.getElementById("search").disabled = false;
    }
    else{
        document.getElementById("search").disabled = true;
    }
});

$(document).on('input', '#location-text', function(e) {
    var input=$(this);
    var errmsg = document.getElementById("location-text");
    errmsg = errmsg.parentNode.children[1];
    if(input.val().replace(/\s/g, '').length || input.val()==""){
        input.removeClass("invalid").addClass("valid");
        errmsg.classList.remove("error_show");
        errmsg.style.display="none";
        if(input.val()!=""){
            is_loc = true;
        }
        else{
            is_loc = false;
        }
    }
    else{
        input.removeClass("valid").addClass("invalid");
        errmsg.classList.add("error_show");
        errmsg.style.display="block";
        is_loc = false;
    }
    var radio = document.getElementsByName("gridRadios");
    var val="";
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            val = radio[i].value;
        }
    }
    if(val==="here"){
        is_loc = true;
    }

    if(isIPAPI && is_keyword && is_loc){
        document.getElementById("search").disabled = false;
    }
    else{
         document.getElementById("search").disabled = true;
    }
});

function get_location(){
//    localStorage.clear();
    initAutocomplete();
    $.getJSON("http://ip-api.com/json", function(data) {
        console.log(data);
        if(data.status == "success"){
            lat = data.lat;
            lng = data.lon;
            current_loc = lat+"+"+lng;
            isIPAPI = true;
        } else {
            isIPAPI = false;
        }
    });
    
}

window.onload = get_location;

function myFunctionLoc(){
    var location_text= document.getElementById("location-text"); 
    location_text.disabled=false; 
    location_text.required = true;               
}

function myFunctionHere(){
    var location_text= document.getElementById("location-text"); 
    location_text.value = "";
    location_text.disabled=true; 
    location_text.required = false;
}

function submitData(){
    flag = 0;
    clearTable("table-data");
    $('#next').css('display', 'none');
    $('#details').css('display', 'none');
    $("#prev-token").prop("disabled",true);
    $("#details-token").prop("disabled",true);
    $('#warning').css('display','none');
    $('#list').css('display','none');
    $('#danger').css('display','none');
    $('#favourite-data').css('display','none');
    $('#fav').removeClass('btn-primary').addClass('btn-link');
    $('#results').removeClass('btn-link').addClass('btn-primary');
    var keyword = document.getElementById("key").value;
    keyword = keyword.split(/[ ,]+/);
    var a = "";
    for(var i=0; i<keyword.length; i++){
       a += keyword[i] + "+"; 
    }
    keyword = a.substring(0,a.length-1);
    var category = document.getElementById("category").value;
    var radius = document.getElementById("dist").value;
    if (radius.length == 0) {
        radius = 10;
    } 
    var location_text = document.getElementById("location-text").value;
    if (location_text.length == 0) {
        location_text = current_loc;
//        location_text = "&lat="+lat+"&lon="+lng;
    } else {
        location_text = location_text.split(/[ ,]+/);
        var a = "";
        for(var i=0; i<location_text.length; i++){
           a += location_text[i] + "+"; 
        }
        location_text = a.substring(0,a.length-1);    
    }
    source = location_text;
    var data = "calling=submit-data"+ "&keyword="+keyword+'&type='+category+'&radius='+radius+"&location="+location_text;
    tokens.push(data);
    page_no = 0;
    flag = 0;
    $('#show-progress-bar').css('display','block');
    AJAXCall(data);
}

function AJAXCall(data){
//    console.log('http://1bm13cs014-env.us-west-1.elasticbeanstalk.com/?'+data);
    $.ajax({
//        url: 'http://1bm13cs014-env.us-west-1.elasticbeanstalk.com/?'+data,
        url: 'http://127.0.0.1:8081/?'+data,
        dataType: "html",
        type: 'GET',
        success: function (response) {
            $('#show-progress-bar').css('display','none');
            $('#danger').css('display','none');
            var ret = jQuery.parseJSON(response);
            if(flag==0){
                extractData(ret);
            } else if(flag ==1){
                if(ret.status == 'ZERO_RESULTS'){
                    review_flag_yelp = true;
                } else {
                    review_flag_yelp = false;
                    $('reviews-parent-yelp').css('display','none');
                    getYelpDetails(ret);
                }
            }        
        },
        error: function (xhr, status, error) {
            $('#danger').css('display','block');
            $('#show-progress-bar').css('display','none');
        },
    });
}

function extractData(data){
    clearTable("table-data");
    if(data.status == "ZERO_RESULTS" || data.status == "INVALID_REQUEST" || data.results.length == 0){
        data_flag = false;
        $('#warning').css('display', 'block');
    } else {
        data_flag = true;
        $('#warning').css('display', 'none');
        var table = document.createElement("table"); 
        table.setAttribute("class","table table-hover");
        table.classList.add('mt-3');
        var headers = ["#","Category","Name","Address","Favourite","Details"];
        var tead = document.createElement("thead");
        var trow = document.createElement("tr");
        for(var i=0; i<headers.length; i++){
            var headerDataCell = document.createElement("th");
            headerDataCell.setAttribute("scope","col");
            var headerData = document.createTextNode(headers[i]);
            headerDataCell.appendChild(headerData);
            trow.appendChild(headerDataCell);

        } 
        tead.appendChild(trow);
        table.appendChild(tead);

        var tbody = document.createElement("tbody");
        for(var i=0; i<data.results.length; i++){
            var row = document.createElement("tr"); 
            row.setAttribute('icon',data.results[i].icon);
            row.setAttribute('name',data.results[i].name);
            row.setAttribute('address',data.results[i].vicinity);
            row.setAttribute('placeId',data.results[i].place_id);
            row.setAttribute("lat",data.results[i].geometry.location.lat);
            row.setAttribute("lng",data.results[i].geometry.location.lng);
    //        row.setAttribute("height","25px");

            // Item count
            var dataCell = document.createElement("th");
            dataCell.setAttribute("scope","row");
    //        dataCell.style.paddingBottom = "0px";
            var nCell = document.createTextNode(i+1);
            dataCell.appendChild(nCell);
            row.appendChild(dataCell);

            // For icon
            dataCell = document.createElement("td");
    //        dataCell.style.paddingBottom = "0px";
            var img = document.createElement("img");
            img.setAttribute("src",data.results[i].icon);
            img.setAttribute("height","35px");
            dataCell.appendChild(img);
            row.appendChild(dataCell);

            // For Name
            dataCell = document.createElement("td");
    //        dataCell.style.paddingBottom = "0px";
            var name = document.createTextNode(data.results[i].name);
            dataCell.appendChild(name);
            row.appendChild(dataCell);

            //For Address
            dataCell = document.createElement("td");
            dataCell.style.paddingBottom = "0px";
            var address = document.createTextNode(data.results[i].vicinity);
            dataCell.appendChild(address);
            row.appendChild(dataCell);

            //For Favourites
            dataCell = document.createElement("td");
    //        dataCell.style.paddingBottom = "0px";
            var but = document.createElement("button");
            but.classList.add("btn");
            but.classList.add("btn-outline-secondary")
            but.setAttribute('onclick',"clickFavourites(this);");
            but.setAttribute('place_id',data.results[i].place_id);
            var italics = document.createElement("i")
            if(localStorage.getItem(data.results[i].place_id)==null){
                italics.setAttribute("class","fa fa-star-o");
            } else {
                italics.setAttribute("class","fa fa-star checked");
            }
            but.append(italics);
            dataCell.appendChild(but);
            row.appendChild(dataCell);

            //For Details
            dataCell = document.createElement("td");
    //        dataCell.style.paddingBottom = "0px";
            var but = document.createElement("button");
            but.setAttribute("name",data.results[i].name);
            but.setAttribute("id","details-data");
            but.setAttribute("place_id",data.results[i].place_id);
            but.setAttribute("lat",data.results[i].geometry.location.lat);
            but.setAttribute("lng",data.results[i].geometry.location.lng);
            but.classList.add("btn");
            but.setAttribute('address',data.results[i].vicinity);
            but.classList.add("btn-outline-secondary");
            but.setAttribute("onclick","getDetail(this);")    

            var italics = document.createElement("i")
            italics.setAttribute("class","fa fa-chevron-right");
            but.append(italics);
            dataCell.appendChild(but);
            row.appendChild(dataCell);

            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        if(data.next_page_token){
            var url = "calling=next-data&pagetoken="+data.next_page_token;
            next_token = url;
            $('#next').css('display', 'block');
            $("#next-token").prop("disabled",false); 
        } else {
            $('#next').css('display', 'none');
            $("#next-token").prop("disabled",true); 
        }
        if(page_no==0){
            $("#prev-token").prop("disabled",true);
            $('#prev').css('display', 'none');
        }
        $('#details').css('display', 'block');

        var div = document.getElementById("table-data");
        div.append(table);
        $('#table-data').css('display', 'block');
    }
}

function clearTable(id){
    var myNode = document.getElementById(id);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function nextDetails(){
    var token_val = '';
    $('#prev').css('display', 'block');
    $("#prev-token").prop("disabled",false);
    if((page_no+1)<tokens.length){
        token_val = tokens[page_no+1];
    } else {
        token_val = next_token;
        tokens.push(next_token);
    }
    page_no += 1;
    flag = 0;
    AJAXCall(token_val);
}

function prevDetails(){
    flag = 0;
    page_no = page_no-1;
    AJAXCall(tokens[page_no]);
}

function getDetail(button){
    resetTabs();
    store_details = button;
    $("#detail-name").html(button.getAttribute('name'));
    $("#detail-name").addClass("text-center");
    $('#to-address').val(button.getAttribute('address'));
    $('#details').css('display', 'none');
    $('#favourite-data').css('display','none');
    $('#fav').removeClass('btn-primary').addClass('btn-link');
    $('#results').removeClass('btn-link').addClass('btn-primary');
    $('#next').css('display', 'none');
    $('#prev').css('display', 'none');
    $('#table-data').css('display', 'none');
    $("#details-token").prop("disabled",false);
    
    var place_id = button.getAttribute('place_id');
    console.log("clicked Get Details");
    if(localStorage.getItem(place_id)==null){
        $("#star").addClass('fa-star-o');
        $("#star").removeClass('fa-star');
        $("#star").removeClass('checkedStar');
    } else {
        $("#star").addClass('fa-star');
        $("#star").addClass('checkedStar');
        $("#star").removeClass('fa-star-o')
    }
    destination = button.getAttribute('lat')+","+button.getAttribute('lng');
    placeNameDetails(place_id,button.getAttribute('name'));
}

function onClickList(){
    $('#details').css('display', 'block');
    $('#list').css('display', 'none');
    $('#table-data').css('display', 'block');
    $('#next').css('display', 'block');
    if(page_no>0){
        $('#prev').css('display', 'block');
    } else {
        $('#prev').css('display', 'none');  
    } 
    var stars = document.getElementsByClassName("checked");
    var length = stars.length;
    var data = [];
    for(var i=0; i<length; i++){
        data[i] = stars[i].parentNode;
    }
    for(var i=0; i<length; i++){
        var parent = data[i];
        var idCheck = localStorage.getItem(parent.getAttribute('place_id'));
        if(idCheck==null){
            parent.innerHTML = '<i class="fa fa-star-o"></i>';
        }
    }
}

function onClickDetail(){
    $('#details').css('display', 'none');
    $('#list').css('display', 'block');
    $('#table-data').css('display', 'none');
    $('#next').css('display', 'none');
    $('#prev').css('display', 'none');
    $('#favourite-data').css('display', 'none');
}

function placeNameDetails(id, name) {
    initMap();
    service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            $('#show-progress-bar').css('display','none');
            $('#list').css('display', 'block');
            $('#danger').css('display','none');
            showPlaceNameDetails(place, name, id);
        } else {
            $('#danger').css('display','block');
            $('#list').css('display', 'none');
            $('#show-progress-bar').css('display','none');
        }
    });
}

function showPlaceNameDetails(data, name, placeId){
    information(data,name, placeId);
    photos_info(data);
    reviews_info(data, name);
    yelp_data(data, name);
}

function information(data,name,placeId){
    $("#star").parent().attr("placeid",placeId);
    clearTable("home");
    console.log(data);
    var table = document.createElement("table"); 
    table.setAttribute("class","table table-striped");
    
    var tead = document.createElement("thead");
    var trow = document.createElement("tr");
    for(var i=0; i<2; i++){
        var headerDataCell = document.createElement("th");
        trow.appendChild(headerDataCell);
    } 
    tead.appendChild(trow);
    table.appendChild(tead);
    
    var tbody = document.createElement("tbody");
    trow =  document.createElement("tr");
    
    // Address
    if(data.formatted_address){
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Address');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        dataCellContent =  document.createTextNode(data.formatted_address);
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    
    // Phone Number
    if(data.international_phone_number) {
        trow = document.createElement("tr");
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Phone Number');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        dataCellContent =  document.createTextNode(data.international_phone_number);
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    
    // Price Number
    if(data.price_level) {
        trow = document.createElement("tr");
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Price Level');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        var s = '';
        for(var l=0; l<data.price_level; l++){
            s = s + '$';
        }
        dataCellContent =  document.createTextNode(s);
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    
    // Rating
    if(data.rating){
        trow = document.createElement("tr");
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Rating');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        var parent = document.createElement('div');
        parent.classList.add('row');
        var d = document.createElement('div');
        d.setAttribute('id','infoRating');
        parent.appendChild(d);
        
        var dC =  document.createElement("div");
        dataCellContent =  document.createTextNode(data.rating);
        dC.append(dataCellContent);
        parent.appendChild(dC);
        dataCell.append(parent);
        trow.appendChild(dataCell);
        rate(data.rating,'infoRating');
        
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    // Google Page
    if(data.url) {
        trow = document.createElement("tr");
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Google Page');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        var link = document.createElement('a');
        link.setAttribute("href",data.url);
        link.setAttribute("target", "_blank");
        dataCellContent =  document.createTextNode(data.url);
        link.append(dataCellContent);
        dataCell.append(link);
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    // Website
    if(data.website) {
        trow = document.createElement("tr");
        var dataCell =  document.createElement("th");
        var dataCellContent =  document.createTextNode('Website');
        dataCell.append(dataCellContent);
        trow.appendChild(dataCell);

        dataCell =  document.createElement("td");
        link = document.createElement('a');
        link.setAttribute("href",data.website);
        link.setAttribute("target", "_blank");
        dataCellContent =  document.createTextNode(data.website);
        link.append(dataCellContent);
        dataCell.append(link);
        trow.appendChild(dataCell);

        tbody.append(trow);
    }
    
    // Hours
    if(data.opening_hours) {
        if(data.opening_hours.weekday_text.length!=0){
            trow = document.createElement("tr");
            var dataCell =  document.createElement("th");
            var dataCellContent =  document.createTextNode('Hours');
            dataCell.append(dataCellContent);
            trow.appendChild(dataCell);

            var n = new Date();
            n = n.getDay()-1;
            var d = data.opening_hours.weekday_text[n];
            var index = d.indexOf(':');
            var timing = d.substr(index+1, d.length);
            dataCell =  document.createElement("td");
            if(data.opening_hours.open_now)
                dataCellContent =  document.createTextNode('Open now '+timing);
            else
                dataCellContent =  document.createTextNode('Closed');
            dataCell.append(dataCellContent);
            var link = document.createElement('a');

            createModal(data.opening_hours.weekday_text);
            link.setAttribute('href','#');
            link.setAttribute('data-toggle',"modal");
            link.setAttribute('data-target',"#myModal");
            link.classList.add('ml-2')
            dataCellContent =  document.createTextNode('Daily open hours');
            link.append(dataCellContent);
            dataCell.append(link);
            trow.appendChild(dataCell);

            tbody.append(trow);
        }
    }
    table.appendChild(tbody);
    
    var twitter_value = 'Check out '+name+" located at "+data.formatted_address+" .Website: "+data.website;
    var val = document.getElementById('twitter');
    val.value = twitter_value;
//    $('#home').css('display','block');
    var div = document.getElementById("home");
    div.append(table);
}

function photos_info(data){
    clearTable("menu1");
    var photos = data.photos;
    if(!photos){
        photo_flag = true;
    } 
    else {
        photo_flag = false;
        var main_div = document.getElementById("menu1");
        main_div.classList.add('card-columns');
        main_div.classList.add('mt-3');
        for(var j=0; j<photos.length; j++){
            var photo_url = photos[j].getUrl({'maxWidth': 1000, 'maxHeight': 1000});
            var card_div = document.createElement('div');
            card_div.classList.add('card');
            var link = document.createElement('a');
            link.setAttribute('href',photo_url);
            link.setAttribute("target", "_blank");
            var image = document.createElement('img');
            image.classList.add('img-thumbnail'); 
            image.classList.add('rounded'); image.setAttribute('src', photo_url);
            link.append(image);
            card_div.append(link);
            main_div.appendChild(card_div);
        }
    }
}

function reviews_info(data, name){
    clearTable("reviews-parent-google");
    var reviews = data.reviews;
    if(!reviews){
        review_flag = true;
    } 
    else {
        review_flag = false;
        var main_div = document.getElementById("reviews-parent-google");
        for (var j=0; j<reviews.length; j++){
            var card = document.createElement('div');
            card.setAttribute('rate',reviews[j].rating);
            card.setAttribute('timing',reviews[j].time);
            card.setAttribute('original_order',j);
            card.classList.add('card');

            card.classList.add('p-1');
            card.classList.add('m-3');
            var rows = document.createElement('div');
            rows.classList.add('row');

            rows.classList.add('p-2');
            
            // Author profile picture
            var first_col = document.createElement('div');
            first_col.classList.add('col');
            first_col.classList.add('col-sm-1');
            var link = document.createElement('a');
            link.setAttribute('href',reviews[j].author_url);
            link.setAttribute('target','_blank');
            var pic = document.createElement('img');
            pic.setAttribute('src', reviews[j].profile_photo_url);
            pic.setAttribute('width','50px');
            pic.setAttribute('height','50px');
            link.append(pic)
            first_col.append(link); 
            rows.appendChild(first_col);
            
            // Author name
            var second_col = document.createElement('div');
            second_col.classList.add('col');
            var name_row = document.createElement('div');
            name_row.classList.add('row');
            name_row.classList.add('text-primary');
            var bold = document.createElement('h6');
            var author_name = document.createTextNode(reviews[j].author_name);
            bold.append(author_name);
            if(reviews[j].author_url){
                var link = document.createElement('a');
                link.setAttribute('href',reviews[j].author_url);
                link.setAttribute('target','_blank');
                link.append(bold);
                name_row.append(link);
            } else
                name_row.append(bold);
            second_col.append(name_row);
            
            //Author Rating and Time
            var name_row = document.createElement('div');
            var col1 = document.createElement('div');
            col1.classList.add('col-1');
            col1.setAttribute('id','rateYo'+j);
            name_row.appendChild(col1);
//            col1 = document.createElement('div');
//            var ratings = document.createTextNode(reviews[j].rating);
//            col1.append(ratings);
//            name_row.appendChild(col1);
            
            col1 = document.createElement('div');
            col1.classList.add('col');
            col1.classList.add('text-secondary');
            col1.classList.add('mr-5');
            col1.classList.add('pl-1');
            var now = moment.unix(reviews[j].time).format('YYYY-MM-DD h:mm:ss');
            var timing = document.createTextNode(now);
            col1.append(timing);
            name_row.append(col1);
            
            name_row.classList.add('row');
            
            rate(reviews[j].rating,'rateYo'+j);     

            second_col.append(name_row);
            
            //Author Review
            var name_row = document.createElement('div');
            name_row.classList.add('row');
            var author_name = document.createTextNode(reviews[j].text);
            name_row.append(author_name);
            second_col.append(name_row);
            
            rows.append(second_col);
            card.append(rows)
            main_div.appendChild(card);
            
        }
    }
}

function createModal(hours){
    clearTable('timings');
    var table = document.createElement('table');
    table.classList.add('table');
    var d = new Date();
    var k = d.getDay()-1;
    if(k==-1)
        k = 6;
    var row = document.createElement('tr');
    var index = hours[k].indexOf(':');
    var day = hours[k].substr(0,index);
    var timing = hours[k].substr(index+1, hours[k].length);
    var td = document.createElement('td');
    var td_data = document.createTextNode(day);
    td.append(td_data);
    row.appendChild(td);
    row.classList.add('h6');
    
    td = document.createElement('td');
    td_data = document.createTextNode(timing);
    td.append(td_data);
    row.appendChild(td);

    table.append(row);
    
    for(var i=0; i<hours.length; i++){
        var modulo = (k+i)%7;
        if(modulo != k){
            var row = document.createElement('tr');
            var index = hours[modulo].indexOf(':');
            var day = hours[modulo].substr(0,index);
            var timing = hours[modulo].substr(index+1, hours[modulo].length);
            var td = document.createElement('td');
            var td_data = document.createTextNode(day);
            td.append(td_data);
            row.appendChild(td);

            td = document.createElement('td');
            td_data = document.createTextNode(timing);
            td.append(td_data);
            row.appendChild(td);

            table.append(row);
        }
    }
    var div = document.getElementById('timings');
    div.append(table);
}

function maps_info(){
    initMap();
    var to_address = document.getElementById('to-address').value;
    var from_address = document.getElementById('from-address').value.toLowerCase();
    if(from_address=='your location'||from_address=='current location'||from_address=='my location'){
        
        from_address = {lat: lat, lng: lng};
    }
    var mode = document.getElementById('travel-mode').value;
    marker.setMap(null);
    var ds = new google.maps.DirectionsService(); 
    directionsDisplay.setMap(map);
    var request = {
        origin: from_address,
        destination: to_address,
        travelMode: mode,
        provideRouteAlternatives: true,
    };
    ds.route(request, function(result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
            $('#suggested-route').css('display','block');
        
           clearTable('suggested-route'); directionsDisplay.setPanel(document.getElementById('suggested-route'));
        } else {
            $('#suggested-route').css('display','none');
        }
    });
    var add_map = document.getElementById('add-map');
    var add_pano = document.getElementById('add-pano');
    if(add_map.style.display =='none'){
        add_pano.style.display='none';
        add_map.style.display='block';
        $('#maps-view').prop('src','http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png');
    }
}

window.initMap = function(){
    var loc = destination.split(",");
    map = new google.maps.Map(document.getElementById('map'), {
        center:  {lat: Number(loc[0]), lng: Number(loc[1])},
        zoom: 15
    });
    
    directionsDisplay= new google.maps.DirectionsRenderer();
    marker = new google.maps.Marker({
      position:  {lat: Number(loc[0]), lng: Number(loc[1])},
      map: map
    });
    clearTable('suggested-route'); 
}

function streetView(){
    var add_pano = document.getElementById('add-pano');
    var add_map = document.getElementById('add-map');
    if(add_pano.style.display =='block'){
        add_pano.style.display='none';
        add_map.style.display='block';
        $('#maps-view').prop('src','http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png');
    }
    else{
        add_map.style.display = 'none'; 
        add_pano.style.display='block';
        $('#maps-view').prop('src','http://cs-server.usc.edu:45678/hw/hw8/images/Map.png');
    }
    var loc = destination.split(",");
    var pos = {lat: Number(loc[0]), lng: Number(loc[1])};
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            position: pos,
            pov: {
                heading: 34,
                pitch: 10
            }
        });
    map.setStreetView(panorama);
}

function yelp_data(result,name){
    var address_components = result.address_components;
    var street = "", route = "", neighbourhood = "", locality = "", area_level_2 = "", area_level_1 = "", country = "", postal_code = "", data='', phone='';
    data = '&name='+name;
    for(var i=0; i<address_components.length; i++){
        if(address_components[i].types[0] == 'street'){
            street = address_components[i].long_name;
            data = '&street='+street;
        }
        if(address_components[i].types[0] == 'route'){
            route = address_components[i].long_name;
            data += '&address1='+route;
        }
        if(address_components[i].types[0] == 'neighbourhood'){
            neighbourhood = address_components[i].short_name;
            data += '&address2='+neighbourhood;
        }
        if(address_components[i].types[0] == 'locality'){
            locality = address_components[i].short_name;
            data += '&city='+locality;
        }
//        if(address_components[i].types[0] == 'administrative_area_level_2'){
//            area_level_2 = address_components[i].short_name;
//            data += '&city='+area_level_2;
//        }
        if(address_components[i].types[0] == 'administrative_area_level_1'){
            area_level_1 = address_components[i].short_name;
            data += '&state='+area_level_1;
        }
        if(address_components[i].types[0] == 'country'){
            country = address_components[i].short_name;
            data += '&country='+country;
        }
        if(address_components[i].types[0] == 'postal_code'){
            postal_code = address_components[i].short_name;
             data += '&postal_code='+postal_code;
        }
    }
    if(result.formatted_phone_number){
        data += '&phone='+result.formatted_phone_number;
    }
//    if(result.geometry[0].viewport.b.b)
//        data += '&lng='+result.geometry.viewport.b.b;
//    if(result.geometry.viewport.f.b)
//        data += '&lat='+result.geometry.viewport.f.b;
    data = "calling=yelp-data"+data; 
    flag = 1;
    AJAXCall(data);
}

function getYelpDetails(data){
    clearTable("reviews-parent-yelp");
    var reviews = data.reviews;
    if(!reviews){
        review_flag_yelp = true;
    } 
    else {
        review_flag_yelp = false;
        var main_div = document.getElementById("reviews-parent-yelp");
        for (var j=0; j<reviews.length; j++){
            var card = document.createElement('div');
            card.setAttribute('rate',reviews[j].rating);
            var ts = moment(reviews[j].time_created, 'YYYY-MM-DD h:mm:ss').valueOf();
            var m = moment(ts);
            var s = m.format('YYYY-MM-DD h:mm:ss');
        
            card.setAttribute('timing',ts);
            card.setAttribute('original_order',j);
            card.classList.add('card');

            card.classList.add('p-1');
            card.classList.add('m-3');
            var rows = document.createElement('div');
            rows.classList.add('row');

            rows.classList.add('p-2');
            
            // Author profile picture
           if(reviews[j].user.image_url){
                var first_col = document.createElement('div');
                first_col.classList.add('col');
                first_col.classList.add('col-sm-1');
                var link = document.createElement('a');
                link.setAttribute('href',reviews[j].url);
                link.setAttribute('target','_blank');
                var pic = document.createElement('img');
                pic.setAttribute('src', reviews[j].user.image_url);
                pic.setAttribute('width','40px');
                pic.setAttribute('height','40px');
                link.append(pic);
                first_col.append(link); 
                rows.appendChild(first_col);
            }
            
            // Author name
            var second_col = document.createElement('div');
            second_col.classList.add('col');
            var name_row = document.createElement('div');
            name_row.classList.add('row');
            name_row.classList.add('text-primary');
            var bold = document.createElement('h6');
            var author_name = document.createTextNode(reviews[j].user.name);
            bold.append(author_name);
            if(reviews[j].url){
                var link = document.createElement('a');
                link.setAttribute('href',reviews[j].url);
                link.setAttribute('target','_blank');
                link.append(bold);
                name_row.append(link);
            } else
                name_row.append(bold);
            second_col.append(name_row);
            
            //Author Rating and Time
            var name_row = document.createElement('div');
            var col1 = document.createElement('div');
            col1.classList.add('col-1');
            col1.setAttribute('id','rateYelp'+j);
            name_row.append(col1);
            
            col1 = document.createElement('div');
            col1.classList.add('col');
            col1.classList.add('text-secondary');
            col1.classList.add('mr-5');
            col1.classList.add('pl-1');
//            var now = moment.unix(reviews[j].time).format('YYYY-MM-DD h:mm:ss');
            var timing = document.createTextNode(reviews[j].time_created);
            col1.append(timing);
            name_row.append(col1);
            
            name_row.classList.add('row');
            
            rate(reviews[j].rating,'rateYelp'+j);     

            second_col.append(name_row);
            
            //Author Review
            var name_row = document.createElement('div');
            name_row.classList.add('row');
            var author_name = document.createTextNode(reviews[j].text);
            name_row.append(author_name);
            second_col.append(name_row);
            
            rows.append(second_col);
            card.append(rows)
            main_div.appendChild(card);
            
        }
    }
}

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('location-text')), {types: ['geocode']}
    );
        autocomplete.addListener('place_changed', otherLocation);

    autocomplete2 = new google.maps.places.Autocomplete(
        (document.getElementById('from-address')), {types: ['geocode']}
    );
        autocomplete2.addListener('place_changed', fromAddress);
}

function otherLocation() {
   autocompleteplace = autocomplete.getPlace();
}

function fromAddress() {
   autocompleteplace = autocomplete2.getPlace();
}

function checkWarning(variable){
    switch(variable){
        case 'info': $('#warning').css('display','none');
                    break;
        case 'maps': $('#warning').css('display','none');
                    break;
    }
    if(photo_flag&&variable=='photo'){
        $('#warning').css('display','block')
    }
    else if(variable=='photo'){
        $('#warning').css('display','none')
    }
//    if((review_flag||review_flag_yelp)&&variable=='review'){
//        $('#warning').css('display','block')
//    }
//    else if(variable=='review'){
//        $('#warning').css('display','none')
//    }
}

function clickTwitter(){    
    window.open("https://twitter.com/share?url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Ftweet-button&via=twitterdev&related=twitterapi%2Ctwitter&text="+document.getElementById('twitter').value,'_blank','width=500,height=500');   
}

function clickFavourites(element){
    var parentNode = element.parentNode.parentNode;
    var placeId = parentNode.getAttribute('placeId');
    var localId = localStorage.getItem(placeId);
    if(localId==null){
        localStorage.setItem(placeId,parentNode.getAttribute('icon')+"**"+parentNode.getAttribute('name')+"**"+parentNode.getAttribute('address')+"**"
                            +parentNode.getAttribute("lat")+"**"+parentNode.getAttribute("lng"));
        element.innerHTML = "<i class='fa fa-star checked'></i>";
        favouriteTable();
    } else {
        localStorage.removeItem(placeId);
        element.innerHTML = "<i class='fa fa-star-o'></i>";
        favouriteTable();
    }
}

function favouriteTable(){
    clearTable('favourite-data');  
    var tabular = document.createElement('table');
    tabular.classList.add('table');
    tabular.classList.add('table-hover');
    tabular.classList.add('mt-3');
    // vertical-align:0px
    var headers = ["#","Category","Name","Address","Favourite","Details"];
    var tead = document.createElement("thead");
    var trow = document.createElement("tr");
    //    trow.setAttribute("height","35px");
    for(var i=0; i<headers.length; i++){
        var headerDataCell = document.createElement("th");
        headerDataCell.setAttribute("scope","col");
        var headerData = document.createTextNode(headers[i]);
        headerDataCell.appendChild(headerData);
        trow.appendChild(headerDataCell);
    } 
    tead.appendChild(trow);
    tabular.appendChild(tead);

    var tbody = document.createElement("tbody");
 
   
    for(var i=0; i<localStorage.length; i++){        
        var key = localStorage.key(i);
        var value = localStorage[key].split("**");
        var row = document.createElement("tr"); 
        row.setAttribute('icon',value[0]);
        row.setAttribute('name',value[1]);
        row.setAttribute('address',value[2]);
        row.setAttribute('placeId',key);
//        row.setAttribute("height","25px");

        // Item count
        var dataCell = document.createElement("th");
        dataCell.setAttribute("scope","row");
//        dataCell.style.paddingBottom = "0px";
        var nCell = document.createTextNode(i+1);
        dataCell.appendChild(nCell);
        row.appendChild(dataCell);

        // For icon
        dataCell = document.createElement("td");
//        dataCell.style.paddingBottom = "0px";
        var img = document.createElement("img");
        img.setAttribute("src",value[0]);
        img.setAttribute("height","35px");
        dataCell.appendChild(img);
        row.appendChild(dataCell);

        // For Name
        dataCell = document.createElement("td");
//        dataCell.style.paddingBottom = "0px";
        var name = document.createTextNode(value[1]);
        dataCell.appendChild(name);
        row.appendChild(dataCell);

        //For Address
        dataCell = document.createElement("td");
        dataCell.style.paddingBottom = "0px";
        var address = document.createTextNode(value[2]);
        dataCell.appendChild(address);
        row.appendChild(dataCell);

        //For Favourites
        dataCell = document.createElement("td");
//        dataCell.style.paddingBottom = "0px";
        var but = document.createElement("button");
        but.classList.add("btn");
        but.classList.add("btn-outline-secondary")
        but.setAttribute('onclick',"deleteFavourites(this);");
        but.setAttribute('place_id',key);
        var italics = document.createElement("i")
        italics.setAttribute("class","fa fa-trash-o");
        but.append(italics);
        dataCell.appendChild(but);
        row.appendChild(dataCell);

        //For Details
        dataCell = document.createElement("td");
//        dataCell.style.paddingBottom = "0px";
        var but = document.createElement("button");
        but.setAttribute("name",value[1]);
        but.setAttribute("id","details-data");
        but.setAttribute("place_id",key);
        but.setAttribute("lat",value[3]);
        but.setAttribute("lng",value[4]);
        but.classList.add("btn");
        but.setAttribute('address',value[2]);
        but.classList.add("btn-outline-secondary");
        but.setAttribute("onclick","getDetail(this);")    

        var italics = document.createElement("i")
        italics.setAttribute("class","fa fa-chevron-right");
        but.append(italics);
        dataCell.appendChild(but);
        row.appendChild(dataCell);

        tbody.appendChild(row);
    }
    
    tabular.append(tbody);
    
    var div = document.getElementById("favourite-data");
    div.append(tabular); 
}

function deleteFavourites(element){
    var placeId = element.getAttribute('place_id');
    localStorage.removeItem(placeId);
    favouriteTable();
    if(!delete_flag)
        createFavouriteTable();
    else
        delete_flag = false;
}

function createFavouriteTable(){
    $('#list').css('display','none');
    $('#prev').css('display','none');
    $('#next').css('display','none');
    $('#results').removeClass('btn-primary').addClass('btn-link');
    $('#table-data').css('display', 'none');
    $('#details').css('display', 'none');
    $('#fav').removeClass('btn-link').addClass('btn-primary');
    console.log("LocalStorage length: "+localStorage.length);
    if(localStorage.length==0){
        $('#favourite-data').css('display','none');
        $('#warning').css('display','block');
    } else {
        $('#warning').css('display','none'); 
        $('#favourite-data').css('display', 'block');    
    }
    favouriteTable();
}

function testing(element){
    console.log("clicked Testing");
    if(localStorage.getItem(element.getAttribute('placeid'))==null){
        $('#star').addClass('fa-star');
        $('#star').addClass('checkedStar');
        $('#star').removeClass('fa-star-o');
        clickFavourites(store_details.parentNode.parentNode.childNodes[4].firstChild);
    } else {
        $('#star').removeClass('fa-star');
        $('#star').removeClass('checkedStar');
        $('#star').addClass('fa-star-o');
        delete_flag = true;
        deleteFavourites(store_details.parentNode.parentNode.childNodes[4].firstChild);
    }
}

function rate(rating,id) {
    $("#"+id).ready(function () {
        $("#"+id).rateYo({
            rating: ((rating/Math.ceil(rating))*100)+"%",
            precision: 1,
            starWidth:"15px",
            readOnly:true,
            numStars:Math.ceil(rating)
        });
    });
}

function sort_original_order(){
    var div = "";
    if(document.getElementById("reviews").value=="Google Reviews"){
        div = document.getElementById("reviews-parent-google");
    } else {
        div = document.getElementById("reviews-parent-yelp");
    }
    var children = div.children;
    var elements = [].slice.call(children).sort(function (a, b){
        if(a.getAttribute("original_order") > b.getAttribute("original_order")) {
            return 1;
        } else return -1;
    });
    elements.forEach(function (p) {
        div.appendChild(p);
    });
}

function sort_reviews(rating_order,sorting_order){
    var div = "";
    if(document.getElementById("reviews").value=="Google Reviews"){
        div = document.getElementById("reviews-parent-google");
    } else {
        div = document.getElementById("reviews-parent-yelp");
    }
    var children = div.children;
    if(rating_order) {
        if(sorting_order) {
            var elements = [].slice.call(children).sort(function (a, b){
                if(a.getAttribute("rate") > b.getAttribute("rate")) {
                    return 1;
                } else return -1;
            });
            elements.forEach(function (p) {
                div.appendChild(p);
            });
        }
        else {
            var elements = [].slice.call(children).sort(function (a, b){
                 if(a.getAttribute("rate") < b.getAttribute("rate")) {
                    return 1;
                } else return -1;
            });
            elements.forEach(function (p) {
                div.appendChild(p);
            });
        }
    }
    else {
        if(sorting_order) {
            var elements = [].slice.call(children).sort(function (a, b){
                 if(Number(a.getAttribute("timing")) > Number(b.getAttribute("timing"))) {
                    return 1;
                } else return -1;
            });
            elements.forEach(function (p) {
                div.appendChild(p);
            });
        }
        else {
            var elements = [].slice.call(children).sort(function (a, b){
                if(Number(a.getAttribute("timing")) < Number(b.getAttribute("timing"))) {
                    return 1;
                } else return -1;
            });
            elements.forEach(function (p) {
                div.appendChild(p);
            });

        }
    }
}

function sample(element){
    switch(element.value){
        case 'Default Order': sort_original_order();
                                break;
        case 'Highest Rating': sort_reviews(true,false);
                                break;
        case 'Lowest Rating': sort_reviews(true,true);
                                break;
        case 'Most Recent': sort_reviews(false,false);
                                break;
        case 'Least Recent': sort_reviews(false,true);
                                break;
    }
    
}

function switchReviews(element){
    if(element.value == 'Google Reviews'){
        $('#reviews-parent-yelp').css('display','none');
        $('#reviews-parent-google').css('display','block');
        if(review_flag)
            $('#warning').css('display','block');
        else
            $('#warning').css('display','none');
    }
    if(element.value == 'Yelp Reviews'){
        $('#reviews-parent-yelp').css('display','block');
        $('#reviews-parent-google').css('display','none');
        if(review_flag_yelp)
            $('#warning').css('display','block');
        else
            $('#warning').css('display','none');
            
    }
}

function onClickResults(){
    $('#fav').removeClass('btn-primary').addClass('btn-link');
    $('#results').removeClass('btn-link').addClass('btn-primary');
    $('#warning').css('display','none');
    $('#favourite-data').css('display','none');
    if(data_flag!=''){
        $('#favourite-data').css('display','none');
        $('#table-data').css('display','block');
        $('#list').css('display','none');
        $('#warning').css('display','none');
        $('#details').css('display','block');
        if(!data_flag)
            $('#warning').css('display','block');
        else{
            $('#warning').css('display','none');
            document.getElementById('next').style.display = 'block';
            if(page_no>0){   
                $('#prev').css('display','block');
            } else {
                $('#prev').css('display','none');
            }
            var stars = document.getElementsByClassName("checked");
            var length = stars.length;
            var data = [];
            for(var i=0; i<length; i++){
                data[i] = stars[i].parentNode;
            }
            for(var i=0; i<length; i++){
                var parent = data[i];
                var idCheck = localStorage.getItem(parent.getAttribute('place_id'));
                if(idCheck==null){
                    parent.innerHTML = '<i class="fa fa-star-o"></i>';
                }
            }
        }
    }
}

function printLocalStorage(){
    console.log("Local Storage: ");
    for (i = 0; i < localStorage.length; i++)   {
        console.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]");
    }
}

function clearEverything(){

    document.getElementById("key").value="";
    document.getElementById("category").value="default";
    document.getElementById("dist").value=""; 
    document.getElementById("current-location").checked = true;
    var location_text = document.getElementById("location-text");
    location_text.value="";
    location_text.disabled=true;  
    
    $('#details').css('display','none');
    $('#list').css('display','none');
    $('#table-data').css('display','none');
    $('#favourite-data').css('display','none');
    $('#prev').css('display','none')
    $('#next').css('display','none')
    $('#warning').css('display','none')
    
    $('#fav').removeClass('btn-primary').addClass('btn-link');
    $('#results').removeClass('btn-link').addClass('btn-primary');
    clearTable('table-data');
}

function resetTabs(){
    $(function () {
        $('.nav li:first-child a').tab('show');
    });
}

function toggle(){
    var radio = document.getElementsByName("gridRadios");
    var locField = document.getElementById("location-text");
    var val = "";
    for(var i=0;i<radio.length;i++){
        if(radio[i].checked){
            val = radio[i].value;
        }
    }
    if(val==="other"){
        locField.disabled=false;
        is_loc = false;
        document.getElementById("search").disabled = true;
    }
    else{
        locField.disabled=true;
        locField.value = "";
        locField.classList.remove("invalid");
        if(document.getElementById("key").value!=""){
           document.getElementById("search").disabled = false;
        }
    }
}
