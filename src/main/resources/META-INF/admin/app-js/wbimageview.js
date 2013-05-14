var errorsGeneral = {
	'ERROR_IMAGE_NAME_LENGTH': 'Image name length must be between 1 and 250 characters',
	'ERROR_IMAGE_NAME_BAD_FORMAT': 'Invalid format for image name: allowed characters are 0-9, a-z, A-Z, -, _,. (, is not an allowed character)',
	'ERROR_IMAGE_FILENAME_LENGTH': 'Image file path cannot be empty',
};

$().ready( function () {
	var wbImageValidations = { 
		name: [{rule: { rangeLength: { 'min': 1, 'max': 250 } }, error: "ERROR_IMAGE_NAME_LENGTH" }, {rule:{customRegexp:{pattern:"^[0-9a-zA-Z_.-]*$", modifiers:"gi"}}, error:"ERROR_IMAGE_NAME_BAD_FORMAT"}],
		filename: [{rule: { rangeLength: { 'min': 1, 'max': 1024 } }, error: "ERROR_IMAGE_FILENAME_LENGTH" }],
	};

	$('#wbuImageDataUpdateForm').wbObjectManager( { fieldsPrefix:'wbud',
								  errorLabelsPrefix: 'errud',
								  errorGeneral:"errudgeneral",
								  errorLabelClassName: 'errorvalidationlabel',
								  errorInputClassName: 'errorvalidationinput',
								  validationRules: wbImageValidations
								});
	$('#wbuImageUploadUpdateForm').wbObjectManager( { fieldsPrefix:'wbuu',
								  errorLabelsPrefix: 'erruu',
								  errorGeneral:"erruugeneral",
								  errorLabelClassName: 'errorvalidationlabel',
								  errorInputClassName: 'errorvalidationinput',
								  validationRules: wbImageValidations
								});

	var displayHandler = function (fieldId, record) {
		if (fieldId == "blobKey") {
			return "<img src='./wbserveimage?blobKey={0}'>".format( encodeURIComponent(record['blobKey']) );
		} else
		if (fieldId == 'lastModified') {
			var date = new Date();
			return date.toFormatString(record[fieldId], "dd/mm/yyyy hh:mm:ss");
		} 

		return escapehtml(record[fieldId]);
	}
	
	$('#wbImageView').wbDisplayObject( { fieldsPrefix: 'wbimage', customHandler: displayHandler} );

	var imageKey = getURLParameter('key'); 
	var imageBlobKey = "";
	
	var fSuccessGetImage = function (data) {
		$('#wbImageView').wbDisplayObject().display(data);
		imageBlobKey = data['blobKey'];
		getServingUrl(0);
	}
	var fErrorGetImage = function (errors, data) {
		alert(data);
	}
	
	$('#wbImageView').wbCommunicationManager().ajax ( { url:"./wbimage/" + encodeURIComponent(imageKey),
											 httpOperation:"GET", 
											 payloadData:"",
											 functionSuccess: fSuccessGetImage,
											 functionError: fErrorGetImage
											} );	
											
	var fSuccessGetServeingUrl = function (data) {
		$('#wbimageblobKey').html('<img src="' + encodeURI(data['url']) + '">');
		$('.servingurl').html('<a target="_new" href="' + encodeURI(data['url']) + '">' + escapehtml(data['url']) + '</a>');
	}
	var fErrorGetServingUrl = function (errors, data) {
		alert(data);
	};
											
	var getServingUrl =  function (imageSize) {
		//var imageSize = parseInt ($('.wbImageSizeInputClass').val());
		var ajaxUrl = "./wbserveimageurl?blobKey=" + encodeURIComponent(imageBlobKey);
		if (imageSize != Number.NaN && imageSize > 0) {
			ajaxUrl += ('&size=' + encodeURIComponent(imageSize));
		}
		$('#wbImageView').wbCommunicationManager().ajax ( { url:ajaxUrl,
										 httpOperation:"GET", 
										 payloadData:"",
										 functionSuccess: fSuccessGetServeingUrl,
										 functionError: fErrorGetServingUrl
										} );	
	};
	
	$('.wbImageDataSaveBtnClass').click ( function (e) {
		e.preventDefault();
		
	});
	var fSuccessImageUpdate = function (data) {
		$('#wbModalImageDataUpdate').modal('hide');
		window.location.reload();
	};
	
	var fErrorImageUpdate = function (errors, data) {
		alert(data);
	};
	
	$('.wbImageDataSaveBtnClass').click ( function (e) {
		e.preventDefault();
		var errors = $('#wbuImageDataUpdateForm').wbObjectManager().validateFieldsAndSetLabels( errorsGeneral );
		if ($.isEmptyObject(errors)) {
			var image = $('#wbuImageDataUpdateForm').wbObjectManager().getObjectFromFields();
			var jsonText = JSON.stringify(image);
			$('#wbImageView').wbCommunicationManager().ajax ( { url: "./wbimage/" + encodeURIComponent(imageKey),
															 httpOperation:"PUT", 
															 payloadData:jsonText,
															 wbObjectManager : $('#wbuImageDataUpdateForm').wbObjectManager(),
															 functionSuccess: fSuccessImageUpdate,
															 functionError: fErrorImageUpdate
															 } );
		}
			
	});	
	
	var fSuccessGetImageForUpdate = function (data) {	
		$('#wbuImageDataUpdateForm').wbObjectManager().resetFields();
		$('#wbuImageDataUpdateForm').wbObjectManager().populateFieldsFromObject(data);
		$('#wbModalImageDataUpdate').modal('show');
	}
	
	
	$('.wbUpdateImageDataBtnClass').click ( function (e) {
		e.preventDefault();
		$('#wbImageView').wbCommunicationManager().ajax ( { url:"./wbimage/" + encodeURIComponent(imageKey),
										 httpOperation:"GET", 
										 payloadData:"",
										 functionSuccess: fSuccessGetImageForUpdate,
										 functionError: fErrorGetImage
										} );	

			});

	$('.wbUpdateUploadImageBtnClass').click ( function (e) {
		e.preventDefault();
		$('#wbuImageUploadUpdateForm').wbObjectManager().resetFields();
		$('#wbuImageUploadUpdateForm').wbCommunicationManager().ajax ( { url: "./wbuploaddata",
												 httpOperation:"GET", 
												 payloadData:"",
												 functionSuccess: fSuccessGetUpload,
												 functionError: fErrorGetUpload
												 } );	
	});
		
	var fSuccessGetUpload = function ( data ) {
		$('#wbuImageUploadUpdateForm')[0].setAttribute('action', data.url);
		$('#wbuImageUploadUpdateForm')[0].setAttribute('method', "post");
		$('#wbuukey').val(imageKey);
		$('#wbModalImageUploadUpdate').modal('show');			
	}
	var fErrorGetUpload = function (errors, data) {
		alert(data);
	}

	$('.imageUploadUpdateSave').click( function (e) {
		e.preventDefault();
		var errors = $('#wbuImageUploadUpdateForm').wbObjectManager().validateFieldsAndSetLabels( errorsGeneral );
		if ($.isEmptyObject(errors)) {
			$('#wbuImageUploadUpdateForm').submit();
		}
	});

	
});