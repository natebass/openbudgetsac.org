const ob = ob || {}

(function(namespace, undefined) {
	namespace.hash = function() {

		const _s = '.'

		return {
			separator: function(s) {
				_s = s
			},
			parse: function() {
				if (window.location.hash.length < 2) {
					return []
				}
				const str = window.location.hash
				str = str.replace("#","")
				const keys = str.split(_s)
				return keys
			},
			set: function(keys) {
			}



		}
	}
})(ob)
