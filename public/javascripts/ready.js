$(function(){	
	$('#shortenedurl_iframe').height($(window).height() - 94);
	
	$(window).resize(function() {
	  $('#shortenedurl_iframe').height($(window).height() - 94);
	});				
});	