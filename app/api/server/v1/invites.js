import { Meteor } from 'meteor/meteor';

import { API } from '../api';
import { findOrCreateInvite } from '../../../invites/server/functions/findOrCreateInvite';
import { listInvites } from '../../../invites/server/functions/listInvites';
import { useInviteToken } from '../../../invites/server/functions/useInviteToken';
import { validateInviteToken } from '../../../invites/server/functions/validateInviteToken';
import { Invites, Rooms } from '../../../models';

API.v1.addRoute('listInvites', { authRequired: true }, {
	get() {
		const result = listInvites(this.userId);
		return API.v1.success(result);
	},
});

API.v1.addRoute('findOrCreateInvite', { authRequired: true }, {
	post() {
		const { rid, days, maxUses } = this.bodyParams;
		const result = findOrCreateInvite(this.userId, { rid, days, maxUses });

		return API.v1.success(result);
	},
});

API.v1.addRoute('useInviteToken', { authRequired: true }, {
	post() {
		const { token } = this.bodyParams;
		const result = useInviteToken(this.userId, token);

		return API.v1.success(result);
	},
});

API.v1.addRoute('validateInviteToken', { authRequired: false }, {
	post() {
		const { token } = this.bodyParams;

		if (!token) {
			throw new Meteor.Error('error-invalid-token', 'The invite token is invalid.', { method: 'validateInviteToken', field: 'token' });
		}

		const inviteData = Invites.findOneByHash(token);
		const room = inviteData && Rooms.findOneById(inviteData.rid);

		const result = validateInviteToken(inviteData, room);

		return API.v1.success({ valid: result });
	},
});