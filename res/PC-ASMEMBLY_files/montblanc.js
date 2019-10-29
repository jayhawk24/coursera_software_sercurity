
jQuery(document).ready(function($) { //noconflict wrapper
	$('input#submit').addClass('btn btn-primary');
	
	$("#commentform").removeAttr("novalidate");

	$("[rel='tooltip']").tooltip();

	$('.comment-toggle').click(function () {
    $('#commentreveal').slideToggle('2000', function () {
        // Animation complete.
    });
	});

	$('#search_toggle').toggle(
	function(){
		$('#menu-main').slideToggle('200');
		$('.search-box').delay(500).slideToggle('200');
	},
	function(){
		$('#menu-main').delay(500).slideToggle('200');
		$('.search-box').slideToggle('200');
	});

});//end noconflict