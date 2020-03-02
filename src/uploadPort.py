from SCons.Script.SConscript import Import


Import("env")

env.AutodetectUploadPort()
address = env.Dump("UPLOAD_PORT")



print "aaaaaa" + address