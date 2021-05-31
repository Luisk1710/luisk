$('.nav .dropdown').on('touchstart.dropdownMenu', function(event) {
    event.stopPropagation();
    if (!$(event.currentTarget).find('.dropdown-menu').is(':visible')) {
        // hide any drop down menus that are already open and show the one
        // relevant to the current event target. Prevent the default so the
        // initial touch displays the sub menu, the second following the top
        // level link
        $('.dropdown-menu').removeClass('show');
        $(event.currentTarget).find('.dropdown-menu').addClass('show');
        event.preventDefault();
        $(document).on('touchstart.navbar', function() {
            $('.dropdown-menu').removeClass('show');
            $(document).off('touchstart.navbar');
        });
    }
}).mouseenter(event => {
    $(event.currentTarget).find('.dropdown-menu').addClass('show');
}).mouseleave(event => {
    $(event.currentTarget).find('.dropdown-menu').removeClass('show');
});
