
# Motivation and Target audience

We want to provide an online storage system for the users, where they can upload their songs from the disk into an drive, which is accessible anywhere and everywhere through the internet.
Music has become an important part of our lives. People listen to it for recreation or health. Some people even live, breathe, and perform music.
Music has lots of benefits. It can improve the mood, make us productive and release stress. One of the best ways of listening to music is to listen to it online. It can be downloaded from anywhere around the world at just the click of a button. There is a wide variety of songs available for the various kinds of users.

The music portal is useful to a wide variety of audience, almost of all age groups and different cultural backgrounds. Every user can upload and download a song according to his choice. He can also access the songs shared by his peer groups, cultural group or any other group.

We envision that it will be a service that lets users upload and play songs from their own collection s. Our target demographic is users who listen to podcasts and less popular music. We envision this being a modern replacement to Grooveshark in the future.


#Source of Data

###Tables
- User:   Id, Name, FB Id, FB Token, Email, Password
- Song:   Trackname, Uploader Id, Security Type(public/private), Artist, Track Link
- Share:  Share From, Share To, Song Id
- Rating: User Id, Song Id, rating

###Source
- User: User can signup either by entering “Email and Password” or using “Facebook” hence from there “Name, FB Id, FB Token” we getting these entries.
- Song: User can upload song from it's device and we extract the meta data from songs IdV3 tags which let us get “Trackname, Artist and Track Link”, simultaneously we are taking input from user whether he want to make song Private or Public(only after uploading, one time). Since he can upload song only after log in so from ther we are getting Uploader Id.
- Share: A particular user can share a particular song with a user by typing corresponding user Id.
- Rating: A user can rate a particular song, and from there we are getting “User Id, Song Id, rating”.
- Sample Data: It has been taken from https://archive.org/details/bhagavad_gita_0803_librivox and we have put all these songs public at initial stage.
- Clean-up Process: As we are using IdV3 tags so our data is authenticated so there is no need to clean it up.


#E-R Diagram

There are two modes of accessing that we have created:
###User
1. User can upload a music file.
2. User can play a music file.
3. User can make a music file public or private at intial stage as after uploading it.
4. User can also share his music files with other users.
5. Can not access others private songs.
###Administrator
1. Have access to every song irrespective of public or private.
2. Have permission to delete any song or user.
3. Admin can make a song public or private.
4. Admin can upload songs.
5. Can share songs with other users.
We have designed seprate pages, views for users and Admin because of difference in accessible permissions.



# Modes of Operation
- **System view**: We have the 'user', which stores the details of a user. There is also a table 'song', which stores the details of a song when its uploaded. The admin has access to all the songs and he can delete it. There is also a table 'share' which contains the details of all the songs shared between two users. The 'rating' table contains the ratings of all the songs which has been rated by the users.

- **User View**: A user has access only to those songs which are uploaded by him, shared to him or is public. He can also see the rating for that song. He can't access any other song.
Every user has the access or modify his own profile. He can't access any other person's profile.

# Platforms used
Front end – Angular, satellizer, Bootstrap
Back end – Nodejs , express, sequelize, mysql
