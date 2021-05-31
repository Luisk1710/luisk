// Default current form to first form on page
var currentForm = $('form:first');

// Explicitly render any recaptchas that are on the page
var renderRecaptchas = function() {
  var recaptchas = $('.g-recaptcha');
  recaptchas.each(function() {
    var currentForm = $(this).closest('form');
    var params = {
      sitekey: $(this).attr('data-sitekey'),
      theme: $(this).attr('data-theme'),
      type: $(this).attr('data-type'),
      size: $(this).attr('data-size'),
      callback: function() {
        currentForm.find('button[type=submit]').attr('disabled', false);
      }
    };
    var widgetId = grecaptcha.render(this, params);
    $(this).attr('widgetId', widgetId);

    // also disable the submit button of any form with a recaptcha
    $(this).closest('form').find('button[type=submit]').attr('disabled', true);
  })
};

// Close the confirmation popup
var closeConfirmationMessage = function(event) {
  var message = $(event.target.closest('.popup'));
  message.removeClass('show').addClass('hide');
};

// Show the confirmation popup
var showConfirmationMessage = function(id) {
  var form = $('#' + id);
  var message = form.find('.confirmation-message');
  message.find('.close-message').click(closeConfirmationMessage);
  message.removeClass('hide').addClass('show');
  form.trigger('reset');
};

// Show the error popup
var showErrorMessage = function(id) {
  var form = $('#' + id);
  var message = form.find('.error-message');
  message.find('.close-message').click(closeConfirmationMessage);
  message.removeClass('hide').addClass('show');
};

// Make background colour semi-transparent
var getBackgroundColor = function(color) {
  var rgba = color.substring(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',');
  if (rgba.length == 4) {
    rgba[3] = rgba[3] / 2;
  }
  else {
    rgba.push(0.5);
  }
  return 'rgba(' + rgba.toString() + ')';
};

// Submit the form
var submitForm = function(form, id, hostname) {
  var formData = new FormData(form[0]);
  if (hostname) {
    formData.append('hostname', hostname);
  }
  formData.append('original_site', window.location.protocol + '//' + window.location.host);


  $.ajax({
    url: secureURL + '/_form/submit',
    type: 'post',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    success: function(data) {
      if (data && data.success) {
        showConfirmationMessage(id);
      } else {
        showErrorMessage(id);
      }
    },
    error: function(data) {
      showErrorMessage(id);
    }
  })

  // Fire event with Google Analytics
  if(window.ga) {
    ga(
      'send',
      {
        hitType: 'event',
        eventCategory: 'Forms',
        eventAction: 'submit',
        eventLabel: form.attr('name') || '<unnamed from>'
      }
    );
  }

};

// Validate fields and recaptcha, then submit form
$('form.form-component').on('submit', function(event) {

  // remove validation hightlighting and hide tooltip
  $(this).find('input, textarea').css('background-color', 'white');
  $(this).find('input[type=file]').css('background-color', 'initial');
  $(this).find('.form-tooltip').hide();

  event.preventDefault();
  var formIsValid = true;
  var id = event.target.id;
  var form = $('#' + id);

  var validationColor = form.find('input[name=validationColor]').val();
  var border = validationColor;
  var background = getBackgroundColor(validationColor);

  // Validate any required fields
  var required = form.find('[required]');
  required.each(function() {
    if ($(this).is('input[type=checkbox]') || $(this).is('input[type=radio]')) {
      var inputGroup = $(this).closest('.form-input');
      if (inputGroup.find('input:checked').length === 0) {
        var tooltip = inputGroup.find('.field-label .form-tooltip');
        tooltip.attr('data-original-title', 'this field is required');
        tooltip.tooltip({container: 'body'});
        tooltip.show();
        formIsValid = false;
      }
    }
    else if (!this.value.trim()) {
      var tooltip = $(this).closest('.field-label').find('.form-tooltip');
      tooltip.attr('data-original-title', 'this field is required');
      tooltip.tooltip({container: 'body'});
      tooltip.show();

      if (!$(this).is('select')) {
        this.style['background-color'] = background;
        this.style['border-color'] = border;
      }
      formIsValid = false;
    }
  });

  // Validate any email fields
  var emailInputs = form.find('[type=email]');
  emailInputs.each(function() {
    if (this.value) {
      var atpos = this.value.indexOf('@');
      var dotpos = this.value.lastIndexOf('.');

      if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= this.value.length) {
        var tooltip = $(this).closest('.field-label').find('.form-tooltip');
        tooltip.attr('data-original-title', 'this is not a valid email address');
        tooltip.tooltip({container: 'body'});
        tooltip.show();

        this.style['background-color'] = background;
        this.style['border-color'] = border;
        formIsValid = false;
      }
    }
  });

  var numberInputs = form.find('[type=number]');
  numberInputs.each(function() {
    if (!this.validity.valid) {
      var tooltip = $(this).closest('.field-label').find('.form-tooltip');
      tooltip.attr('data-original-title', 'this is not a valid number');
      tooltip.tooltip({container: 'body'});
      tooltip.show();

      this.style['background-color'] = background;
      this.style['border-color'] = border;
      formIsValid = false;
    }
  });

  if (formIsValid) {
    // Handle the recaptcha input
    var recaptcha = form.find('.g-recaptcha');
    if (recaptcha.length > 0) {
      var gRecaptchaResponse = form.find('[name=g-recaptcha-response]').val();
      var token = form.find('input[name=tok]').val();

      var data = {
        response: gRecaptchaResponse,
        tok: token,
        todo: 'recaptcha'
      };

      $.ajax({
        url: '/_form/recaptcha',
        type: 'post',
        data: data,
        success: function(data){
          var result = JSON.parse(data.msg);
          if (data && result.success) {
            submitForm(form, id, result.hostname);
          } else {
            showErrorMessage(id);
          }
        },
        error: function(){
          showErrorMessage(id);
        }
      })
    }
    else {
      submitForm(form, id);
    }
  }
  else {
    // scroll to the first invalid field
    var position = form.find('.form-tooltip:visible').offset().top;
    $('html, body').animate({
      scrollTop: position
    });
  }
});

// Reset form
$('form').on('reset', function() {
  $(this).find('input, textarea').css('background-color', 'white');
  $(this).find('input[type=file]').css('background-color', 'initial');
  $(this).find('.form-tooltip').hide();

  var recaptcha = $(this).find('.g-recaptcha');
  if (recaptcha.length && grecaptcha) {
    grecaptcha.reset(recaptcha.attr('widgetId'));
    $(this).find('button[type=submit]').attr('disabled', true);
  }
});

// Clear background highlight on focus
$('.form-component input, .form-component textarea, .form-component select').on('focus', function() {
  if ($(this).is('input, textarea') && !$(this).is('input[type=file]')) {
    $(this).css('background-color', 'white');
  }

  currentForm = $(this).closest('form');
});

// Check the file size client side - additional to check in sitemaker
$('.form-component input[type=file]').on('change', function() {
  var maxFileSize = 10 * 1024 * 1024;
  var tooltip = $(this).closest('.field-label').find('.form-tooltip');
  if (this.files && this.files[0] && this.files[0].size > maxFileSize) {
    var validationColor = $(this).closest('form').find('input[name=validationColor]').val();
    var background = getBackgroundColor(validationColor);

    $(this).val(null);
    $(this).css('background-color', background)
    tooltip.attr('data-original-title', 'max file size is 10Mb');
    tooltip.tooltip({container: 'body'});
    tooltip.show();
  } else {
    $(this).css('background-color', 'initial');
    tooltip.hide();
  }
});

// Reference the current form to enable the submit button on recaptcha callback
$('form').on('mouseenter', function() {
  currentForm = $(this);
});
