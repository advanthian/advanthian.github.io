var UNSENT = 'UNSENT';
var SENDING = 'SENDING';
var SENT = 'SENT';

var ContactFormState = {
	'email': null,
	'message': null,

	'state': UNSENT,
	'status_message': null,

	'update': function(key, value) {
		this[key] = value;
	},
	'submit': function() {
		if (
			this.email === null
			|| this.message == null
			|| !this.email.match(/^.+?@.+?\..+?$/)
			|| this.message.length == 0
		) {
			this.update(
				'status_message',
				'Please ensure all of the fields are filled in correctly.');
			return;
		}

		this.update('state', SENDING);
		this.update('status_message', null);

		var form_data = new FormData();
		form_data.append('email', this.email);
		form_data.append('message', this.message);

		m.request({
			'method': 'POST',
			'url': 'https://formspree.io/xlewgjyd',
			'headers': {
				'Accept': 'application/json'
			},
			'body': form_data,
			'responseType': 'json',
			'timeout': 10000  // 10 seconds
		}).then(function(data) {
			if (data.ok == true) {
				ContactFormState.update('state', SENT);
				ContactFormState.update(
					'status_message',
					'Thanks for your message! ' +
					'We\'ll get back to you as soon as we can.');
			} else {
				ContactFormState.update('state', UNSENT);
				ContactFormState.update(
					'status_message',
					'An unknown error occurred, please try again later.');
			}
		}).catch(function(e) {
			ContactFormState.update('state', UNSENT);
			if (e.response)
				ContactFormState.update('status_message', e.response.error);
		});
	}
};

var ContactForm = {
	view: function() {
		var is_unsent = ContactFormState.state == UNSENT;
		var is_sending = ContactFormState.state == SENDING;
		var is_sent = ContactFormState.state == SENT;

		return m('form', [
			m('div.rows', [
				m('div.row.margin-bottom', [
					m('div.columns', [
						m('div.column.col-3', [
							m('label', {'for': 'email'}, [
								'Your Email ', m('b.highlight', '*')
							])
						]),
						m('div.column.col-9', [
							m('input[type="email"]#email', {
								'disabled': !is_unsent,
								'onchange': function(e) {
									var email = e.target.value;
									ContactFormState.update('email', email);
								}
							})
						])
					])
				]),
				m('div.row.margin-bottom', [
					m('div.columns', [
						m('div.column.col-3', [
							m('label', {'for': 'message'}, [
								'Message ', m('b.highlight', '*')
							]),
						]),
						m('div.column.col-9', [
							m('textarea#message.contact-text-area', {
								'disabled': !is_unsent,
								'onchange': function(e) {
									var message = e.target.value;
									ContactFormState.update('message', message);
								}
							})
						])
					])
				]),
				m('div.row.margin-bottom', [
					m('div.columns', [
						m('div.column.col-3'),
						m('div.column', [
							is_sent
							? m('span', {'class': 'icon tick'})
							: m('button', {
								'class': is_sending ? 'spinner' : null,
								'disabled': !is_unsent,
								'onclick': function(e) {
									e.preventDefault();
									ContactFormState.submit();
								}
							}, !is_sending ? 'Send Message' : null)
						]),
						(ContactFormState.status_message ?
							m('div.column.margin-left.vertical-center', [
								ContactFormState.status_message
							])
						: null)
					])
				])
			])
		]);
	}
};
