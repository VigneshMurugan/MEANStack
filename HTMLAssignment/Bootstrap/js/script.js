$(document).ready(function() {
  $(document).scroll(function(){
    if($(document).width() > 768 && $(this).scrollTop() < 50)
    {
      $('#navigationBar').css({"background-color":"transparent"});
    }
    else {
      $('#navigationBar').css({"background-color":"rgb(1,35,72)"});
    }
  }),
  $(function () {
    $('[data-toggle="popover"]').popover();

    $('[rel="tooltip"]').tooltip();
  })
});
