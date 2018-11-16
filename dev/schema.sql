create table payments(
	paymentID varchar(255) not null,
	cost float null,
	projectID varchar(255) null,
	date date null,
	constraint payments_paymentID_uindex
		unique (paymentID)
);

alter table payments add primary key (paymentID);

create table projects(
	projectID varchar(255) not null primary key,
	overseer varchar(255) not null,
	country varchar(255) not null,
	type varchar(255) not null,
	cost float not null,
	startDate date not null,
	endDate date null
);

create table users(
	userID varchar(255) not null,
	firstName varchar(255) null,
	lastName varchar(255) null,
	email varchar(255) not null,
	constraint users_email_uindex unique (email),
	constraint users_userID_uindex unique (userID)
);

alter table users add primary key (userID);

create table user_logins(
	userID varchar(255) not null,
	oauthProvider varchar(255) not null,
	oauthID varchar(255) not null,
	constraint user_logins_users_userID_fk foreign key (userID) references users (userID)
);

create table volunteer_information(
	userID varchar(255) not null primary key,
	address varchar(255) not null,
	city varchar(255) not null,
	locality varchar(255) not null,
	country varchar(255) not null,
	postal varchar(255) not null,
	joined timestamp default CURRENT_TIMESTAMP not null,
	constraint volunteer_information_users_userID_fk foreign key (userID) references users (userID) on update cascade on delete cascade
);
