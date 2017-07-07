$(document).ready(function() {

  /**
   * Open & Close Menu Top
   * ---------------------------------------
   */

  $(document).on('click', '.open-menu.m-close', function(){
    $(this).removeClass('m-close');
    $(this).addClass('open');

    $('.logo-top').addClass('opened');

    $('.menu-opened').removeClass('closed');
    $('.menu-opened').addClass('opened');

    setTimeout(function() {
      $('.menu-opened ul li').removeClass('hideMenu');
      $('.menu-opened ul li').addClass('show');
    }, 200);
  });

  $(document).on('click', '.open-menu.open', function(){
    $(this).removeClass('open');
    $(this).addClass('m-close');

    $('.logo-top').removeClass('opened');

    $('.menu-opened ul li').removeClass('show');
    $('.menu-opened ul li').addClass('hideMenu');
    setTimeout(function() {
      $('.menu-opened').addClass('closed');
      $('.menu-opened').removeClass('opened');
      $('.menu-opened ul li').removeClass('show');
    }, 300);

  });

  /**
   * Instagram Footer
   * ---------------------------------------
   */
  function mostraInstagram(data) {
    var maxImage = 4;
    var html = '<ul>';
    for (var i = 0; i < maxImage; i++) {
      html += `<li>
                  <a href="${data[i].link}" target="_black">
                    <img src="${data[i].images.low_resolution.url}"/>
                  </a>
                </li>`;
    }
    html += '</ul>';
    $('#instagramBlock .mural').html(html);
  }

  if (window.location.host.indexOf('localhost') === -1) {
    var apiHost = "https://api.instagram.com/v1/users/self/media/recent/?access_token=1463654275.1677ed0.cacd3a406d914cd29988ad1bbfcf8238";
    console.log(apiHost);
  }
  else {
    var jsonHost = $.getJSON(`http://${window.location.host}/data/instagram.json`)
      .then((infosInsta) => {
        mostraInstagram(infosInsta.data)
      });
  }

  /**
   * Fixed Menu com scroll
   * ---------------------------------------
   */

  $(window).on('scroll', function() {
    if ($('#menuTop').hasClass('black')) {
      if (window.pageYOffset > 50) {
        console.log('add');
        $('#menuTop').removeClass('absolute').addClass('fixed');
      }
      if (window.pageYOffset <= 50 && $('#menuTop').hasClass('fixed')) {
        $('#menuTop').addClass('absolute').removeClass('fixed');
      }
    }
  });

  /**
   * Tela de cadastro
   * ---------------------------------------
   */

  $(document).on('click', '.cadastro', function() {
    $('#divider').addClass('active');
    $('#signup').addClass('active');
  })




});
