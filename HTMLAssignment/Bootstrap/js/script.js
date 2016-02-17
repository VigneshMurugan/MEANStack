$(document).ready(function() {
  $(document).scroll(function(){
    if($(this).scrollTop() > 50)
    {
      $('#navigationBar').css({"background-color":"rgb(1,35,72)"});
    }
    else if($(document).width() > 768)
    {
        $('#navigationBar').css({"background-color":"transparent"});
    }
  }),
  $(function () {
      $('[data-toggle="popover"]').popover();

      $('[rel="tooltip"]').tooltip();
  })
});
