"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MapPin, Star, Users, Phone, Send, Globe, CheckCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAdmin } from "@/lib/admin-context"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"

export default function TrainingCenterDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { trainingCenters, markStudiedAt, hasStudiedAt, rateCenter } = useAdmin()
  const { isLoggedIn } = useUser()
  const { showToast } = useToast()

  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)

  const center = trainingCenters.find((c) => c.id === id)

  if (!center || center.status !== "approved") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold mb-2">Center not found</h1>
          <p className="text-muted-foreground mb-4">This training center does not exist or is not available.</p>
          <Link href="/training-centers">
            <Button variant="outline">Back to Centers</Button>
          </Link>
        </div>
      </div>
    )
  }

  const studied = hasStudiedAt(center.id)

  const handleMarkStudied = () => {
    if (!isLoggedIn) {
      showToast("Please log in to mark this center as studied.", "warning")
      return
    }
    markStudiedAt(center.id)
    showToast("Added to your studied centers!", "success")
  }

  const handleRate = (rating: number) => {
    if (!isLoggedIn) {
      showToast("Please log in to rate this center.", "warning")
      return
    }
    setUserRating(rating)
    rateCenter(center.id, rating)
    setHasRated(true)
    showToast(`You rated ${center.name} ${rating} stars!`, "success")
  }

  const filteredStudents = center.students.filter((s) => s.username.toLowerCase().includes(studentSearch.toLowerCase()))

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Avatar className="h-24 w-24 rounded-xl">
          <AvatarImage src={center.logo || "/placeholder.svg?height=96&width=96"} alt={center.name} />
          <AvatarFallback className="rounded-xl text-2xl">{center.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{center.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>{center.city}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold text-lg">{center.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({center.ratingCount} reviews)</span>
            </div>
            <Dialog open={studentsModalOpen} onOpenChange={setStudentsModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{center.studentsCount} students</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Students ({center.studentsCount})</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div key={student.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar || "/placeholder.svg?height=40&width=40"} />
                          <AvatarFallback>{student.username.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.username}</p>
                          <p className="text-xs text-muted-foreground">Joined {student.joinedAt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No students found</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {studied ? (
          <Button variant="secondary" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            You Studied Here
          </Button>
        ) : (
          <Button onClick={handleMarkStudied}>
            <CheckCircle className="mr-2 h-4 w-4" />I Studied Here
          </Button>
        )}
        <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact {center.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {center.phone && (
                <a
                  href={`tel:${center.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{center.phone}</p>
                  </div>
                </a>
              )}
              {center.telegram && (
                <a
                  href={`https://t.me/${center.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Send className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">{center.telegram}</p>
                  </div>
                </a>
              )}
              {center.website && (
                <a
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground truncate">{center.website}</p>
                  </div>
                </a>
              )}
              {center.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{center.address}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rating Section */}
      {!hasRated && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Rate this center</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${star <= userRating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="about">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{center.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              <p>Course listings coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              <p>Reviews coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
