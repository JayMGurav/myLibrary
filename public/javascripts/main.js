$(document).ready(function(){
    $('.menuBtn').click(function(){
        $('.header').css({"left":"0px"});
        $('.bookSection').css({"left":"60%","width":"70%"});
    });
    $('.floatingCloseBtn').click(function(){
        $('.header').css({"left":"-600px"});
        $('.bookSection').css({"left":"50%","width":"90%"});
    });
    $('.item').on('click',function(){
        var item = { genre:$(this).text() }
        $('.item').removeClass('active');
        $(this).addClass('active');
        console.log(item);
        $.ajaxSetup({
            xhrFields: {
              withCredentials: true
            }
        })
        $.ajax({
            type: 'POST',
            url: '/users/library',
            data:item,
            dataType: 'json',
            success: function(data){
                // do something with the front-end                       
            }
        });
    });
    $('.delete').click(function(){ //favorite
        var value = { id:$(this).attr("value") }
        $.ajaxSetup({
            xhrFields: {
              withCredentials: true
            }
        })
        $.ajax({
            type: 'DELETE',
            url: '/upload/book',
            data: value,
            dataType: 'json',
            success: function(data){
                // do something with the front-end    
                location.reload()   
                
        }
    })
    })
});
