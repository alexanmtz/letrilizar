var Letrilizar = {
	balloonInstance: null,
	customImage: null,
    defaultOptions: {
        el: $('.letrilizar'),
        sharingText: 'Estamos postando a foto no seu facebook...',
        successText: 'Sua foto foi postada. É só curtir!',
        errorText: 'Ops... ocorreu um erro ao postar a foto',
        subtitle1: 'letrilizar',
        subtitle2: 'letrilizar.com',
        imageSrcPrefix: 'images/',
        formatText: true,
        maxChars: 800,
        changeImage: '.change-image',
        triggerOn: 'selection'
    },
    letrilizar: function(options) {
        this.options = $.extend({}, this.defaultOptions, options);
        this.initialize();
    },
    initialize: function() {
    	var that = this;
        if(this.options.triggerOn == 'selection') {
        	this.options.el.addClass('letrilizar-letrilization-area');
        	this.handleSelection();
        } else {
        	this.changeImage();
        	$(this.options.triggerOn).on('click', function(e){
        		that.newCanvasOnElement();
        		return false;	
        	});
			        	
        } 
    },
    newCanvasOnElement: function(){
    	var txtGenerated = $('#generated-text').val();
    	var element = $('.letrilizar-canvas-content-image');
    	
    	this.balloonInstance.initialize(element);
    	this.balloonInstance.letra = this;
    	this.balloonInstance.text = txtGenerated;
    	this.balloonInstance.style = LetrilizarStyles[0];
    	
    	this.balloonInstance.draw(txtGenerated);
    	
    	var ctx = this.balloonInstance.canvas[0].getContext("2d");
    	
    	this.balloonInstance.show(true);
    	this.balloonInstance.togglePreview(true);
    	
    	if(this.customImage) {
    		ctx.drawImage(this.customImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    	}
    	
    },
    styleChooser: function() {
    	var that = this;
    	var styles = LetrilizarStyles;
		
		var stylesContent = '';
		
		for(s in LetrilizarStyles) {
			stylesContent += '<button type="button" class="btn btn-default" data-index="' + s +  '">' + LetrilizarStyles[s].name +  '</button>';
		}
		
		$('#change-style-button').append(stylesContent).find('button').on('click', function(e){
			that.balloonInstance.chooseStyle($(e.target).attr('data-index'));
			that.balloonInstance.togglePreview(true);
			return false;
		});
    },
    handleSelection: function() {
    	var that = this;
    	this.balloonInstance.initialize(this.options.el, 'selection');
    	this.balloonInstance.letra = this;
        LetrilizarFacebookShare.initialize();
        
        this.options.el.on('mouseup', function(e) {
            if (that.balloonInstance.previewIsOpen()) {
                that.balloonInstance.hide();
                return;
            }
            
            var selection = LetrilizarUtils.getSelection(that.options);
            if (selection.text) {
                that.onSelect(e, selection);
            } else {
                that.balloonInstance.hide();
            }
        });
        
        return this;
    },
    onSelect: function(e, selection) {
        var offset = {};
        var parentOffset = this.options.el.offset();
        var scrollTop = $(window).scrollTop();
        var scrollLeft = $(window).scrollLeft();
        
        //offset.top = (selection.top + parentOffset.top);
        //offset.left = (selection.left + parentOffset.left);
        
        offset.top = selection.top;
        offset.left = selection.left;
        
        // selection position is relative to screen, so
        // is needed to add scroll displacement
        offset.top += scrollTop;
        offset.left += scrollLeft;
        this.balloonInstance.text = selection.formatedText;
        this.balloonInstance.floatAt(offset);
    },
    changeImage: function(balloon) {
    	var that = this;
    	var balloon = this.balloonInstance;
    	$(this.options.changeImage).on("change", function(e) {
	    	//var ctx = balloon.canvas[0].getContext("2d");
	    	
			var reader = new FileReader();
			var file = e.target.files[0];
			// load to image to get it's width/height
			var img = new Image();
			img.onload = function() {
				// scale canvas to image
				//ctx.canvas.width = img.width;
				//ctx.canvas.height = img.height;
				// draw image
				that.customImage = img;
				
			}
			// this is to setup loading the image
			reader.onloadend = function() {
				img.src = reader.result;
			}
			// this is to read the file
			reader.readAsDataURL(file); 

		});
    }
};


var ActionBalloon = {
    elTemplate: $('#letrilizar-template-action-balloon'),
    el: null,
    text: null,
    style: null,
    letra: null,
    canvas: null,
    initialize: function(parentEl, type) {
        var that = this;
		var type = type || '';
		
        if(type=='selection') {
        	parentEl.append(this.elTemplate.html());
        	this.el = parentEl.find('.letrilizar-action-balloon');
        } else {
        	parentEl.empty().append(this.elTemplate.html());
        	this.el = parentEl.find('.letrilizar-action-balloon');
        	this.el.addClass('letrilizar-action-balloon--static');
        	
        }
        
        this.canvas = this.el.find('canvas');
        
        this.el.find('.letrilizar-buttons').on('click', function() { 
            if (!that.previewIsOpen()) {
                that.onShareButtonClick();
            };
        });
        
        this.el.find('.letrilizar-download-button').on('click', function() {
            that.download();
        });
        
        this.changeStyle();
        this.el.find('.letrilizar-change-button').on('click', function() {
            that.changeStyle().draw();
        });
        
        this.el.find('.letrilizar-share-button').on('click', function() {
            that.onShareButtonClick();
        });
        
        this.el.find('.letrilizar-close-button').on('click', function() {
            that.hide();
        });
    },
    onShareButtonClick: function() {
        if (this.previewIsOpen()) {
            this.share();
        } else {
            this.togglePreview();
        }
    },
    floatAt: function(offset) {
        var that = this;
        this.el.offset(offset).css('display','block').addClass('letrilizar-action-balloon--showing');
        setTimeout(function() { that.el.removeClass('letrilizar-action-balloon--showing'); }, 500);
        return this;
    },
    togglePreview: function(toggle) {
    	this.el.toggleClass('letrilizar--active',toggle);
        this.draw();
    },
    previewIsOpen: function() {
        return this.el.is('.letrilizar--active');
    },
    changeStyle: function() {
        this.style = LetrilizarUtils.randomItemFrom(LetrilizarStyles, this.style);
        return this;
    },
    chooseStyle: function(index) {
        this.style = LetrilizarStyles[index];
        return this;
    },
    changeStatus: function(text) {
        this.el.addClass('letrilizar--sharing');
        this.el.find('.letrilizar-status').html(text);
    },
    draw: function(text) {
        var canvas = this.canvas;
        var ctx = canvas[0].getContext("2d");
        
        var subtitle1 = this.letra.options['subtitle1'];
        var subtitle2 = this.letra.options['subtitle2'];
        canvasText = text || this.text;
        
        this.style.draw(canvas[0], canvasText, subtitle1, subtitle2);
        this.canvas = canvas;
    },
    download: function() {
        window.open(this.canvas[0].toDataURL('image/png'));
    },
    share: function() {
        var that = this;
        this.changeStatus(this.letra.options['sharingText']);
        
        LetrilizarFacebookShare.share({
            canvas: this.canvas[0], 
            message: '',
            successCallback: function() {
                that.changeStatus(that.options['successText']);
            },
            errorCallback: function() {
                that.changeStatus(that.options['errorText']);
            }
        });
    },
    hide: function() {
        this.togglePreview(false);
        //this.el.fadeOut();
    },
    show: function() {
    	this.togglePreview(true);
        this.el.fadeIn();
    }
}

var Letrilizando = function() {
	this.current = Object.create(Letrilizar);
	this.current.balloonInstance = Object.create(ActionBalloon);; 
	return this.current;
};